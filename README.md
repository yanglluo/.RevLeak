# RevLeak V5

**Unbreakable Revenue Visibility for Modern SaaS**

RevLeak is a production-ready revenue risk detection system that integrates with Stripe to identify and prevent revenue leaks before they happen.

## Features

- 🔍 **Real-time Leak Detection** - Monitors payment failures, past-due subscriptions, expiring cards, and more
- ⚡ **Intervention Windows** - Prioritized alerts with countdown timers for action deadlines
- 🎯 **One-Click Recovery** - Retry payments, send reminders, and generate payment update links
- 📊 **Revenue Dashboard** - Track revenue at risk, savings, and detection performance
- 🔔 **Smart Alerts** - Email, Slack, and webhook notifications for critical leaks
- 🛡️ **Multiple Detectors** - Payment failures, card expiry, disputes, churn recovery

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Custom Properties (Design System)
- **State**: Zustand
- **Payments**: Stripe SDK
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Stripe API key:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open dashboard**
   ```
   http://localhost:3000
   ```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── sync/route.ts       # Stripe sync & leak detection
│   │   ├── leaks/route.ts      # Leak actions (retry, dismiss)
│   │   └── webhooks/stripe/    # Real-time event processing
│   ├── page.tsx                # Main dashboard
│   ├── leaks/page.tsx          # Active leaks list
│   ├── subscriptions/page.tsx  # Subscription management
│   ├── customers/page.tsx      # Customer overview
│   ├── saved/page.tsx          # Revenue saved tracking
│   ├── alerts/page.tsx         # Notification center
│   ├── detectors/page.tsx      # Detector configuration
│   ├── integrations/page.tsx   # Integration status
│   ├── settings/page.tsx       # Stripe & alert settings
│   └── login/page.tsx          # Authentication
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── DashboardLayout.tsx     # Page layout wrapper
└── lib/
    ├── stripe.ts               # Stripe SDK helpers
    ├── leak-detector.ts        # Detection engine
    ├── types.ts                # TypeScript definitions
    └── store.ts                # Zustand state store
```

## Leak Detection Engine

RevLeak detects the following revenue leak types:

| Leak Type | Priority | Detection Method |
|-----------|----------|------------------|
| Payment Failed | Critical | Failed invoice with `attempted: true` |
| Subscription Past Due | Critical | Status = `past_due` or `unpaid` |
| Card Expired | Critical | Card exp date in the past |
| Card Expiring | Warning | Card expires within 30 days |
| Recoverable Cancel | Warning | Canceled within last 48 hours |

## Stripe Webhook Handler

The webhook handler (`/api/webhooks/stripe`) is production-grade with:

### Features

- **Signature Verification** - Validates all requests using Stripe's SDK
- **Idempotent Processing** - Prevents duplicate event handling via idempotency keys
- **Normalized Storage** - All events stored in consistent schema for audit/replay
- **Replay Protection** - Rejects events older than 10 minutes
- **Atomic Writes** - File storage uses temp-file-then-rename for durability

### Supported Events

| Event Type | Action |
|------------|--------|
| `invoice.payment_failed` | Creates/updates payment_failed leak |
| `invoice.payment_succeeded` | Resolves related payment leaks |
| `customer.subscription.updated` | Detects past_due status changes |
| `customer.subscription.deleted` | Creates recoverable cancellation leak |
| `customer.subscription.created` | Logs new MRR |
| `charge.dispute.created` | Creates critical dispute leak |
| `payment_method.automatically_updated` | Resolves card_expiring leaks |

### Event Flow

```
1. Receive webhook request
2. Verify signature (reject if invalid)
3. Check timestamp freshness (reject if >10min old)
4. Normalize event to canonical schema
5. Check idempotency (skip if already processed)
6. Store event to disk (durability before processing)
7. Process event (business logic)
8. Mark as processed (prevent re-processing)
9. Return 200 OK
```

### Local Testing

Use Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Event Storage

Events are stored in `.data/webhook-events/` with:
- One JSON file per event (named by date and event ID)
- Processed event IDs tracked in `_processed_ids.json`
- Atomic writes prevent corruption

## Deployment

Deploy to Vercel:

```bash
vercel
```

Required environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## License

MIT

