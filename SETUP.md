# RevLeak Setup Guide

This guide will help you set up authentication and the Stripe paywall for your RevLeak application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Testing the Flow](#testing-the-flow)

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Stripe account (test mode is fine for development)

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Enter a project name (e.g., "revleak")
5. Set a strong database password (save this!)
6. Select a region close to your users
7. Click **"Create new project"**

### 2. Run the Database Schema

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste into the SQL Editor
5. Click **"Run"** to create the tables

This creates:
- `profiles` table (stores user info and subscription status)
- `leaks` table (stores detected revenue leaks)
- `webhook_events` table (logs Stripe webhook events)
- Row Level Security policies
- Auto-trigger for profile creation on signup

### 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 4. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

---

## Stripe Configuration

### 1. Create Stripe Products and Prices

1. Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Click **"Add product"**
3. Create 3 products with these names:
   - **Starter** - $19/month or $190/year
   - **Growth** - $49/month or $490/year
   - **Enterprise** - $99/month or $990/year

4. For each product, create both monthly and yearly prices
5. Copy the **Price ID** for each (starts with `price_`)

### 2. Update Price IDs in Code

Open `src/app/page.tsx` and update the price IDs in the `PricingSection` component:

```tsx
const plans = [
    {
        name: 'Starter',
        priceId: annual ? 'price_YOUR_STARTER_YEARLY' : 'price_YOUR_STARTER_MONTHLY',
        // ...
    },
    {
        name: 'Growth',
        priceId: annual ? 'price_YOUR_GROWTH_YEARLY' : 'price_YOUR_GROWTH_MONTHLY',
        // ...
    },
    {
        name: 'Enterprise',
        priceId: annual ? 'price_YOUR_ENTERPRISE_YEARLY' : 'price_YOUR_ENTERPRISE_MONTHLY',
        // ...
    },
];
```

### 3. Configure Stripe Webhooks

For local development:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhooks/subscription
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env.local`.

For production:
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your URL: `https://yourdomain.com/api/webhooks/subscription`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret

---

## Environment Variables

Create or update `.env.local` with all required values:

```bash
# ==============================================================================
# RevLeak Configuration
# ==============================================================================

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Running the Application

1. Install dependencies (if not done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3001](http://localhost:3001)

---

## Testing the Flow

### 1. Test User Registration

1. Go to `/login`
2. Click "Don't have an account? Sign Up"
3. Enter your details and create an account
4. Check your email for verification (if email confirmation is enabled in Supabase)

### 2. Test Stripe Checkout

1. Log in to your account
2. Go to the pricing section
3. Click "Get started" on any plan
4. Complete the Stripe checkout using test card: `4242 4242 4242 4242`
5. After success, you should be redirected to `/checkout/success`
6. Then you can access the `/dashboard`

### 3. Test Webhook Processing

1. Make sure `stripe listen` is running
2. Complete a checkout
3. Check your terminal for webhook events
4. Verify the user's subscription status updated in Supabase

---

## Troubleshooting

### "Supabase Not Configured" Warning

Make sure your `.env.local` has valid Supabase values (not placeholders).

### "Payment failed" Errors

- Check Stripe Dashboard for detailed error messages
- Verify your Stripe secret key is correct
- Make sure webhooks are being received

### Dashboard Access Denied

The dashboard requires:
1. User must be logged in
2. User must have an active subscription (`subscription_status = 'active'`)

Check the user's profile in Supabase to verify their subscription status.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Landing Page   │────▶│   Login/Signup  │────▶│    Checkout     │
│   (Public)      │     │  (Supabase)     │     │   (Stripe)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │◀────│  Success Page   │◀────│   Webhook       │
│  (Protected)    │     │                 │     │  (Updates DB)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Global authentication state |
| `src/components/ProtectedRoute.tsx` | Route protection HOC |
| `src/app/login/page.tsx` | Login/signup page |
| `src/app/checkout/success/page.tsx` | Post-payment success page |
| `src/app/api/checkout/route.ts` | Create Stripe checkout session |
| `src/app/api/checkout/verify/route.ts` | Verify payment completion |
| `src/app/api/webhooks/subscription/route.ts` | Handle Stripe webhooks |
| `supabase/schema.sql` | Database schema |
| `.env.local` | Environment configuration |

---

## Next Steps

- [ ] Set up Supabase with your credentials
- [ ] Create Stripe products and prices
- [ ] Update price IDs in the code
- [ ] Test the full authentication flow
- [ ] Configure webhooks for production
- [ ] Deploy to Vercel

For questions or issues, check the code comments or create an issue in the repository.
