
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE em text;
BEGIN
  SELECT email INTO em FROM auth.users WHERE id = auth.uid();
  IF em IS NULL THEN RETURN false; END IF;
  IF lower(em) = 'admin@rental.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN public.has_role(auth.uid(), 'admin');
END;
$$;
GRANT EXECUTE ON FUNCTION public.ensure_admin_role() TO authenticated;

-- CARS
CREATE TABLE public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Economy',
  rate_per_day integer NOT NULL,
  seats integer NOT NULL DEFAULT 4,
  transmission text NOT NULL DEFAULT 'Manual',
  fuel text NOT NULL DEFAULT 'Petrol',
  description text NOT NULL DEFAULT '',
  image_key text NOT NULL DEFAULT 'sedan',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cars public read" ON public.cars FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cars admin write" ON public.cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BOOKINGS
CREATE TYPE public.booking_status AS ENUM ('pending','approved','rejected','cancelled','completed');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  cnic text NOT NULL,
  email text,
  purpose text NOT NULL DEFAULT 'Trip',
  purpose_other text,
  destination text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  with_driver boolean NOT NULL DEFAULT false,
  notes text,
  status public.booking_status NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "admin read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX bookings_car_dates_idx ON public.bookings (car_id, start_date, end_date);

-- validation
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'Return date must be after pickup date';
  END IF;
  IF NEW.status = 'approved' AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.car_id = NEW.car_id AND b.id <> NEW.id AND b.status = 'approved'
      AND b.start_date < NEW.end_date AND b.end_date > NEW.start_date
  ) THEN
    RAISE EXCEPTION 'This car is already booked for the selected period';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER bookings_validate BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- NOTIFICATIONS (admin)
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete notifications" ON public.notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE car_name text;
BEGIN
  SELECT name INTO car_name FROM public.cars WHERE id = NEW.car_id;
  INSERT INTO public.notifications (booking_id, title, message)
  VALUES (NEW.id, 'New booking request',
    NEW.customer_name || ' requested ' || COALESCE(car_name,'a car') || ' (Ref ' || NEW.reference || ')');
  RETURN NEW;
END;
$$;
CREATE TRIGGER bookings_notify AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_new_booking();

-- PUBLIC AVAILABILITY (dates only)
CREATE OR REPLACE FUNCTION public.get_car_availability()
RETURNS TABLE (car_id uuid, start_date timestamptz, end_date timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.car_id, b.start_date, b.end_date
  FROM public.bookings b
  WHERE b.status = 'approved' AND b.end_date > now()
$$;
GRANT EXECUTE ON FUNCTION public.get_car_availability() TO anon, authenticated;

-- PUBLIC BOOKING LOOKUP
CREATE OR REPLACE FUNCTION public.track_booking(_reference text, _phone text)
RETURNS TABLE (reference text, car_name text, customer_name text, status public.booking_status,
               start_date timestamptz, end_date timestamptz, destination text, purpose text,
               admin_note text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.reference, c.name, b.customer_name, b.status, b.start_date, b.end_date,
         b.destination, b.purpose, b.admin_note, b.created_at
  FROM public.bookings b JOIN public.cars c ON c.id = b.car_id
  WHERE upper(b.reference) = upper(trim(_reference))
    AND regexp_replace(b.phone,'[^0-9]','','g') = regexp_replace(_phone,'[^0-9]','','g')
$$;
GRANT EXECUTE ON FUNCTION public.track_booking(text, text) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- FLEET
INSERT INTO public.cars (name, slug, category, rate_per_day, seats, transmission, fuel, description, image_key, sort_order) VALUES
('Suzuki Alto','alto','Economy',4000,4,'Manual','Petrol','Compact and fuel efficient city hatchback, perfect for short trips and daily commutes.','gli',1),
('Suzuki Cultus','cultus','Economy',5000,4,'Manual','Petrol','Roomy hatchback with smooth handling and great mileage.','hatchback',2),
('Honda City (2016 Old Shape)','honda-city-2016','Sedan',5500,5,'Automatic','Petrol','Reliable sedan, ideal for family outings and city travel.','sedan',3),
('Toyota Corolla GLi','corolla-gli','Sedan',6500,5,'Manual','Petrol','Comfortable and dependable sedan for long routes.','sedan',4),
('Toyota Yaris','yaris','Sedan',7000,5,'Automatic','Petrol','Modern sedan with a refined interior and easy drive.','sedan',5),
('Toyota Corolla Grande','corolla-grande','Premium Sedan',12000,5,'Automatic','Petrol','Top-of-the-line Corolla with premium comfort features.','sedan',6),
('Hyundai Elantra','elantra','Premium Sedan',13000,5,'Automatic','Petrol','Stylish premium sedan with a spacious cabin.','sedan',7),
('Honda Civic X','civic-x','Premium Sedan',10000,5,'Automatic','Petrol','Sporty and elegant, a favourite for weddings and events.','sedan',8),
('Honda Civic (New Shape)','civic-new','Premium Sedan',15000,5,'Automatic','Petrol','Latest generation Civic with a bold design and premium ride.','sedan',9),
('KIA Sportage (Old Shape)','kia-sportage','SUV',16000,5,'Automatic','Petrol','Practical SUV with high ground clearance and comfort.','suv',10),
('Oshan X7','oshan-x7','SUV',18000,7,'Automatic','Petrol','Seven seater crossover, great for family trips.','suv',11),
('Toyota Revo Dala','revo-dala','Pickup / 4x4',28000,5,'Automatic','Diesel','Powerful 4x4 pickup for tough terrain and cargo runs.','pickup',12),
('JAC Dala','jac-dala','Pickup / 4x4',30000,3,'Manual','Diesel','Heavy duty pickup built for loads and rough roads.','pickup',13),
('Haval','haval','SUV',30000,5,'Automatic','Petrol','Modern SUV loaded with technology and comfort.','suv',14),
('Toyota Fortuner','fortuner','SUV',35000,7,'Automatic','Diesel','Commanding 7 seater SUV for highways and off-road.','suv',15),
('Toyota Prado','prado','Luxury SUV',40000,7,'Automatic','Diesel','Luxury 4x4 with legendary reliability and presence.','suv',16),
('Toyota Land Cruiser V8','land-cruiser-v8','Luxury SUV',80000,7,'Automatic','Petrol','Flagship luxury SUV for VIP protocol and premium travel.','suv',17);
