# New Sadiqabad Rent a Car - Project Documentation

## Project Overview

**New Sadiqabad Rent a Car** is a modern web application for managing car rental bookings with self-drive and with-driver options. The platform provides transparent 24-hour rates, verified vehicles, and instant booking confirmation with admin approval workflow.

### Key Features
- ✅ Self-drive and with-driver car rental options
- ✅ Real-time vehicle availability checking
- ✅ Booking reference system for customer tracking
- ✅ Admin dashboard for managing bookings and vehicles
- ✅ Transparent 24-hour rental rates
- ✅ Customer-friendly booking request workflow
- ✅ Admin approval system with notification support

---

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing
- **TanStack React Query** - Data fetching and caching
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Shadcn/ui** - Component library (Radix UI + Tailwind)
- **React Hook Form** - Form management with Zod validation
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database and authentication (PostgreSQL)
- **Node.js** - Runtime environment

### Build & Deployment
- **Vite** - Modern bundler
- **TypeScript** - Compile-time type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## Recent Changes (August 12, 2026)

### 1. **Branding & Logo Update** ✨
   - Added `rentalsdk.jpeg` circular logo as the primary brand logo
   - Implemented rounded logo styling with white circular background (9x9px for header/footer)
   - Updated in three locations:
     - **Header** - `src/components/site-header.tsx`
     - **Footer** - `src/components/site-footer.tsx`
     - **Admin Dashboard** - `src/routes/_authenticated/admin.tsx`
   - Created favicon from logo: `src/assets/rentalsdk.ico`

### 2. **Booking Reference Message** 📋
   - Added prominent warning message for customers after booking request submission
   - Message: *"Save this reference or take a screenshot — you'll need it to track your booking status."*
   - Location: `src/components/booking-form.tsx` (lines 132-133)
   - Displays when booking reference is generated
   - **Note**: Intentionally NOT shown on track/lookup page (already saved by customer)

### 3. **Updated Assets** 🖼️
   - Added `rentalsdk.ico` - Optimized circular favicon
   - Updated car images:
     - `Kia Sportage 16k old shape.jpg`
     - `Prado.jpg`
     - `Land Cruiser V8.jpg`
   - New web icon files for branding

### 4. **Component Updates**
   - **site-header.tsx** - Logo styling with circular white background
   - **site-footer.tsx** - Logo styling with circular white background
   - **booking-form.tsx** - Added booking reference save reminder
   - **track.tsx** - Removed duplicate warning (kept only on booking form)
   - **__root.tsx** - Favicon reference updated to rentalsdk.ico
   - **admin.tsx** - Added rentalsdk logo to admin header

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── booking-form.tsx      # Car booking request form
│   ├── car-card.tsx          # Car display card
│   ├── site-header.tsx       # Main site header with logo
│   ├── site-footer.tsx       # Main site footer with logo
│   ├── status-badge.tsx      # Booking status indicator
│   └── ui/                   # Shadcn/ui components (accordion, button, dialog, etc.)
│
├── routes/              # Page routes (file-based routing)
│   ├── __root.tsx            # Root layout with favicon setup
│   ├── index.tsx             # Home page
│   ├── fleet.tsx             # Vehicle fleet listing
│   ├── cars.$slug.tsx        # Individual car detail page
│   ├── track.tsx             # Booking status tracking page
│   ├── about.tsx             # About page
│   ├── contact.tsx           # Contact page
│   ├── auth.tsx              # Authentication page
│   └── _authenticated/
│       ├── route.tsx         # Protected routes middleware
│       └── admin.tsx         # Admin dashboard (bookings & vehicles)
│
├── integrations/        # Third-party integrations
│   └── supabase/
│       ├── client.ts         # Supabase client setup
│       ├── client.server.ts  # Server-side Supabase
│       ├── auth-middleware.ts    # Auth protection
│       ├── auth-attacher.ts      # Auth context
│       └── types.ts          # TypeScript types
│
├── lib/                 # Utility functions
│   ├── rental.ts        # Rental calculations and types
│   ├── utils.ts         # General utilities
│   ├── error-page.ts    # Error handling
│   └── lovable-error-reporting.ts  # Error tracking
│
├── hooks/               # React hooks
│   └── use-mobile.tsx   # Mobile detection hook
│
├── assets/              # Images and icons
│   ├── rentalsdk.jpeg       # Primary brand logo (circular)
│   ├── rentalsdk.ico        # Favicon
│   ├── [car-images].jpg     # Vehicle images
│   └── webicon.ico          # (Legacy - replaced with rentalsdk.ico)
│
└── styles.css           # Global Tailwind styles

supabase/               # Database migrations
├── config.toml         # Supabase config
└── migrations/         # SQL migration files

public/                 # Static files
├── robots.txt          # SEO robots file
└── favicon.ico         # Browser favicon

Configuration Files:
├── vite.config.ts      # Vite bundler config
├── tsconfig.json       # TypeScript config
├── tailwind.config.ts  # Tailwind CSS config
├── eslint.config.js    # ESLint linting rules
├── bunfig.toml         # Bun package manager config
└── package.json        # Dependencies and scripts
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- Git
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Taha-702/sdkrental.git
   cd drivesure-rentals-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or with Bun
   bun install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     ```

4. **Database Setup**
   - Run Supabase migrations:
     ```bash
     supabase db push
     ```

### Development

**Start development server:**
```bash
npm run dev
# Opens at http://localhost:5173
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Code linting & formatting:**
```bash
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

---

## Key Features Explained

### 1. **Booking System**
- Customers submit booking requests on car detail pages
- Form includes: dates, customer info (name, phone, CNIC), destination, purpose
- System checks for date conflicts with existing bookings
- Generates unique booking reference (e.g., "A1B2C3D4")
- **Important message**: Customers are prompted to save their reference

### 2. **Track Booking Status**
- Customers can check status at `/track` route
- Requires booking reference + phone number
- Shows: vehicle, dates, customer info, and current status
- Status options: pending, approved, rejected, completed, cancelled

### 3. **Admin Dashboard**
- Protected route at `/_authenticated/admin`
- Displays pending booking requests
- Features:
  - Approve/reject bookings
  - Mark bookings as completed/cancelled
  - Add admin notes to bookings
  - Manage vehicles (add, edit, delete)
  - Real-time notifications
  - Dashboard stats (pending, approved, active rentals, revenue)

### 4. **Vehicle Management**
- Display vehicles with: name, category, rate/day, seats, transmission, fuel type
- Vehicle detail pages with booking form
- Admin can manage vehicle availability and pricing
- Vehicle images stored in `src/assets/`

---

## Branding & Logo Usage

### Logo Files
- **Main Logo**: `src/assets/rentalsdk.jpeg` (circular, with white corners)
- **Favicon**: `src/assets/rentalsdk.ico` (optimized for browser tab)

### Logo Placement
1. **Header** - 9x9px circular logo with white background
2. **Footer** - 8x8px circular logo with white background  
3. **Admin Header** - 9x9px circular logo with white background
4. **Favicon** - Browser tab and bookmarks

### Logo Styling
- Uses `rounded-full` Tailwind class for circular container
- White background: `bg-white`
- Sizing: `h-9 w-9` (36px) for header/admin, `h-8 w-8` (32px) for footer
- Object fit: `object-cover` for proper image scaling

---

## Important Notes for Next Developer

### ⚠️ Critical Information

1. **Supabase Integration**
   - Database is hosted on Supabase (PostgreSQL)
   - Migrations are in `supabase/migrations/`
   - Run `supabase db push` after pulling changes

2. **Authentication**
   - Admin dashboard requires authentication
   - Auth middleware in `src/integrations/supabase/auth-middleware.ts`
   - Protected routes use `_authenticated/` folder pattern

3. **Booking Reference Message**
   - Only shows on booking form submission
   - NOT shown on track/lookup page (intentional - they already have it)
   - Location: `src/components/booking-form.tsx` line 132-133

4. **Logo Files**
   - `rentalsdk.jpeg` - Used for header/footer/admin
   - `rentalsdk.ico` - Used for favicon
   - Both are circular logos (white corners on JPEG)
   - Keep both files in `src/assets/`

5. **Vite Configuration**
   - Uses TanStack Router plugin for file-based routing
   - Tailwind CSS with custom configuration
   - Path aliases defined in `tsconfig.json` (use `@/` prefix)

6. **Build/Deploy Note**
   - TypeScript compilation is strict (check tsconfig.json)
   - Prettier is configured for code formatting
   - ESLint enforces code quality
   - Always run `npm run lint && npm run format` before committing

### 🔄 Git Workflow
- Main branch: `main`
- Connected to Lovable (avoid force pushes/rebasing published commits)
- All changes are automatically synced to Lovable editor

### 📝 Commit Messages Template
```
[Feature/Fix/Update] Brief description

- What changed
- Why it changed
- Any related links or references
```

---

## Database Schema Overview

### Tables
1. **cars** - Vehicle inventory
   - id, name, slug, category, rate_per_day, seats, transmission, fuel, description, image_key, sort_order, is_active

2. **bookings** - Rental requests and confirmations
   - id, reference, car_id, customer_name, phone, cnic, email, purpose, destination, start_date, end_date, with_driver, status, admin_note, created_at

3. **notifications** - Admin notifications
   - id, title, message, is_read, created_at

4. **availability** - Booking slots and conflicts
   - Managed through bookings table

---

## Common Tasks

### Add a New Car
1. Go to Admin Dashboard (`/_authenticated/admin`)
2. Click "Add car"
3. Fill in: Name, Category, Rate/day, Seats, Transmission, Fuel, Description
4. Upload image or set image_key
5. Submit

### Approve a Booking
1. Go to Admin Dashboard
2. Find pending booking
3. Click "Approve"
4. (Optional) Add admin note
5. Confirm

### Change Logo
1. Replace/update `src/assets/rentalsdk.jpeg`
2. Update `src/assets/rentalsdk.ico` for favicon
3. No code changes needed (references use file path)
4. Clear browser cache to see changes

### Update Car Images
1. Add new images to `src/assets/`
2. Reference in car detail pages
3. Update car record in admin dashboard with new image_key

---

## Troubleshooting

### Dev server won't start
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node version: `node --version` (should be 18+)

### TypeScript errors
- These may be type declaration warnings, not blocking errors
- Run `npm run lint` to check actual issues
- Type errors won't prevent build in production mode

### Supabase connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check Supabase project is active and not rate-limited
- Verify network connectivity

### Logo not showing
- Clear browser cache (Ctrl+Shift+Delete)
- Verify image file exists: `src/assets/rentalsdk.jpeg`
- Check image path is correct in imports
- Use browser dev tools to inspect image element

---

## Future Enhancements

Consider implementing:
- Payment integration (for online booking confirmation)
- SMS/Email notifications to customers
- Driver selection system
- Insurance options
- Fuel options (full/full, empty/empty)
- Customer rating/review system
- Admin analytics dashboard
- Multi-language support
- Mobile app version

---

## Contact & Support

- **Repository**: https://github.com/Taha-702/sdkrental
- **Supabase Documentation**: https://supabase.com/docs
- **TanStack Router**: https://tanstack.com/router/latest
- **Shadcn/ui**: https://ui.shadcn.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | Aug 12, 2026 | Branding update - rentalsdk logo, booking reference message, favicon |
| 1.1.0 | Aug 12, 2026 | Initial feature set with admin dashboard |
| 1.0.0 | Initial | Project setup |

---

**Last Updated**: August 12, 2026  
**Status**: Production Ready  
**Maintained By**: New Sadiqabad Rent a Car Team
