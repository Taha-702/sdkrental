
DROP POLICY IF EXISTS "anyone can request booking" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon;

CREATE OR REPLACE FUNCTION public.create_booking(
  _car_id uuid,
  _customer_name text,
  _phone text,
  _cnic text,
  _email text,
  _purpose text,
  _purpose_other text,
  _destination text,
  _start_date timestamptz,
  _end_date timestamptz,
  _with_driver boolean,
  _notes text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ref text;
BEGIN
  IF length(trim(_customer_name)) < 3 THEN RAISE EXCEPTION 'Please enter your full name'; END IF;
  IF length(trim(_phone)) < 10 THEN RAISE EXCEPTION 'Please enter a valid phone number'; END IF;
  IF length(trim(_cnic)) < 13 THEN RAISE EXCEPTION 'Please enter a valid CNIC'; END IF;
  IF length(trim(_destination)) < 2 THEN RAISE EXCEPTION 'Please enter the destination'; END IF;
  IF _end_date <= _start_date THEN RAISE EXCEPTION 'Return date must be after pickup date'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cars WHERE id = _car_id AND is_active) THEN
    RAISE EXCEPTION 'Vehicle not available';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.car_id = _car_id AND b.status = 'approved'
      AND b.start_date < _end_date AND b.end_date > _start_date
  ) THEN
    RAISE EXCEPTION 'This car is already booked for the selected period';
  END IF;

  INSERT INTO public.bookings (
    car_id, customer_name, phone, cnic, email, purpose, purpose_other,
    destination, start_date, end_date, with_driver, notes, status
  ) VALUES (
    _car_id, left(trim(_customer_name),80), left(trim(_phone),20), left(trim(_cnic),20),
    nullif(left(trim(coalesce(_email,'')),120),''), left(coalesce(_purpose,'Trip'),60),
    nullif(left(trim(coalesce(_purpose_other,'')),80),''), left(trim(_destination),120),
    _start_date, _end_date, coalesce(_with_driver,false),
    nullif(left(trim(coalesce(_notes,'')),500),''), 'pending'
  ) RETURNING reference INTO ref;

  RETURN ref;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,boolean,text) TO anon, authenticated;
