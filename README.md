# Blueprints Club

Professional blueprint printing service built with Next.js 14, TypeScript, Tailwind CSS, and Neon PostgreSQL.

## Features

- **Public Site**: Home, About, How It Works, Membership, Order, Products, Testimonials, Contact
- **Auth**: Login, Register, Forgot Password
- **User Dashboard**: Order history, profile management, membership status
- **Admin Panel**: Subscribers, Orders, Settings
- **Order System**: File upload, distance calculator, pricing calculator
- **Membership**: 3 tiers (Monthly $39, 6-Month $225, Yearly $435)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Neon PostgreSQL
- Square Payments (subscriptions)
- NextAuth.js (authentication)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual values

# 3. Run database migrations (after connecting Neon)
# npm run db:migrate

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

## Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project named "blueprints-club"
3. Copy the connection string
4. Paste it into `.env.local` as `DATABASE_URL`
5. Run the SQL in `database.sql` in Neon's SQL Editor

## Square Payment Setup

1. Go to [developer.squareup.com](https://developer.squareup.com)
2. Create a new application
3. Get Sandbox Application ID and Access Token
4. Create subscription plans matching your pricing tiers
5. Add credentials to `.env.local`

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Environment Variables on Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SQUARE_APPLICATION_ID`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT`

## Project Structure

```
src/
  app/
    (auth)/          # Login, Register, Forgot Password
    (site)/          # Public pages
    admin/           # Admin panel
    dashboard/       # User dashboard
    api/             # API routes
  components/
    layout/          # Navbar, Footer
    sections/        # Home page sections
  lib/               # Utilities, database
  types/             # TypeScript types
```

## License

Private - Blueprints Club
