/**
 * Production-Grade Stripe Webhook Handler
 * 
 * Features:
 * - Signature verification using Stripe SDK
 * - Idempotent event processing (no duplicate handling)
 * - Normalized event storage with full audit trail
 * - Structured error handling and logging
 * - Replay protection via timestamp validation
 * 
 * This handler prioritizes CORRECTNESS over speed:
 * - All events are persisted before processing
 * - Processing status is tracked and recoverable
 * - Errors are captured with full context
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
    normalizeStripeEvent,
    isEventProcessed,
    markEventProcessed,
    storeEvent,
    updateEvent,
    type NormalizedEvent,
    type NormalizedEventType,
} from '@/lib/webhook-events';

// =============================================================================
// CONFIGURATION
// =============================================================================

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Maximum age of a webhook event we'll accept (in seconds).
 * Stripe recommends 300 seconds (5 minutes).
 * We use a slightly larger window to account for network delays.
 */
const MAX_EVENT_AGE_SECONDS = 600; // 10 minutes

/**
 * Events we actively process for leak detection.
 * Other events are stored but skipped for processing.
 */
const ACTIONABLE_EVENTS = new Set([
    'invoice.payment_failed',
    'invoice.payment_succeeded',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.created',
    'charge.dispute.created',
    'charge.dispute.updated',
    'payment_method.automatically_updated',
]);

// =============================================================================
// LOGGING
// =============================================================================

interface LogContext {
    eventId?: string;
    eventType?: string;
    customerId?: string;
    subscriptionId?: string;
    error?: string;
    duration?: number;
    [key: string]: unknown;
}

function log(level: 'info' | 'warn' | 'error', message: string, context: LogContext = {}): void {
    const timestamp = new Date().toISOString();
    const prefix = `[Webhook][${timestamp}][${level.toUpperCase()}]`;

    const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

    console[level](`${prefix} ${message}${contextStr}`);
}

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

interface VerificationResult {
    success: boolean;
    event?: Stripe.Event;
    error?: string;
    errorCode?: 'MISSING_SIGNATURE' | 'MISSING_SECRET' | 'INVALID_SIGNATURE' | 'EXPIRED_EVENT';
}

/**
 * Verifies the webhook signature and validates event freshness.
 * Returns the verified event or an error.
 */
function verifyWebhookSignature(
    rawBody: string,
    signature: string | null
): VerificationResult {
    // Check for missing signature header
    if (!signature) {
        return {
            success: false,
            error: 'Missing stripe-signature header',
            errorCode: 'MISSING_SIGNATURE',
        };
    }

    // Check for missing webhook secret configuration
    if (!WEBHOOK_SECRET) {
        return {
            success: false,
            error: 'Webhook secret not configured (STRIPE_WEBHOOK_SECRET)',
            errorCode: 'MISSING_SECRET',
        };
    }

    try {
        // Use Stripe SDK for signature verification
        // This handles timestamp validation internally
        const event = getStripe().webhooks.constructEvent(
            rawBody,
            signature,
            WEBHOOK_SECRET
        );

        // Additional timestamp validation for replay protection
        const eventAge = Math.floor(Date.now() / 1000) - event.created;
        if (eventAge > MAX_EVENT_AGE_SECONDS) {
            return {
                success: false,
                error: `Event too old: ${eventAge} seconds (max: ${MAX_EVENT_AGE_SECONDS})`,
                errorCode: 'EXPIRED_EVENT',
            };
        }

        return { success: true, event };
    } catch (err) {
        const error = err as Error;
        return {
            success: false,
            error: error.message,
            errorCode: 'INVALID_SIGNATURE',
        };
    }
}

// =============================================================================
// EVENT PROCESSING
// =============================================================================

/**
 * Processes a normalized event based on its type.
 * This is where business logic for leak detection would execute.
 */
async function processEvent(event: NormalizedEvent): Promise<void> {
    const { normalizedType, stripeEventId, customerId, subscriptionId, invoiceId } = event;

    log('info', `Processing event: ${normalizedType}`, {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
    });

    switch (normalizedType) {
        case 'payment_failed': {
            await handlePaymentFailed(event);
            break;
        }

        case 'payment_succeeded': {
            await handlePaymentSucceeded(event);
            break;
        }

        case 'subscription_updated': {
            await handleSubscriptionUpdated(event);
            break;
        }

        case 'subscription_canceled': {
            await handleSubscriptionCanceled(event);
            break;
        }

        case 'subscription_created': {
            await handleSubscriptionCreated(event);
            break;
        }

        case 'dispute_created':
        case 'dispute_updated': {
            await handleDispute(event);
            break;
        }

        case 'card_updated': {
            await handleCardUpdated(event);
            break;
        }

        default:
            log('info', `Skipping unhandled event type: ${event.stripeEventType}`, {
                eventId: stripeEventId,
            });
    }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handles payment failure events.
 * Creates or updates a leak record for revenue at risk.
 */
async function handlePaymentFailed(event: NormalizedEvent): Promise<void> {
    const {
        stripeEventId,
        customerId,
        subscriptionId,
        invoiceId,
        amountCents,
        currency,
        customerEmail,
        customerName,
    } = event;

    log('info', 'Payment failure detected', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        invoiceId: invoiceId || undefined,
        amountCents: amountCents || undefined,
        currency: currency || undefined,
    });

    // TODO: Integrate with leak detection engine
    // - Create leak record in database
    // - Calculate intervention window
    // - Trigger alert if within threshold
    // 
    // Example:
    // await createOrUpdateLeak({
    //   type: 'payment_failed',
    //   customerId,
    //   subscriptionId,
    //   invoiceId,
    //   amountCents,
    //   currency,
    //   sourceEventId: event.id,
    // });
}

/**
 * Handles payment success events.
 * Resolves any existing leaks for this invoice/subscription.
 */
async function handlePaymentSucceeded(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, customerId, subscriptionId, invoiceId, amountCents } = event;

    log('info', 'Payment succeeded', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        invoiceId: invoiceId || undefined,
        amountCents: amountCents || undefined,
    });

    // TODO: Resolve related leaks
    // - Find leaks by invoiceId or subscriptionId
    // - Update status to 'resolved'
    // - Record resolution source as 'payment_recovered'
    //
    // Example:
    // await resolveLeaks({
    //   invoiceId,
    //   subscriptionId,
    //   resolutionReason: 'payment_recovered',
    //   resolvedAmount: amountCents,
    // });
}

/**
 * Handles subscription update events.
 * Detects status changes that indicate revenue risk.
 */
async function handleSubscriptionUpdated(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, customerId, subscriptionId, rawPayload } = event;

    // Extract subscription status from raw payload
    const eventData = rawPayload as { data?: { object?: { status?: string; previous_attributes?: { status?: string } } } };
    const currentStatus = eventData.data?.object?.status;
    const previousStatus = eventData.data?.object?.previous_attributes?.status;

    log('info', 'Subscription updated', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        currentStatus,
        previousStatus,
    });

    // Check for status transitions that indicate risk
    if (currentStatus === 'past_due' || currentStatus === 'unpaid') {
        // TODO: Create leak for past_due subscription
        log('warn', 'Subscription entered risky state', {
            eventId: stripeEventId,
            status: currentStatus,
        });
    } else if (previousStatus === 'past_due' && currentStatus === 'active') {
        // TODO: Resolve past_due leak
        log('info', 'Subscription recovered from past_due', {
            eventId: stripeEventId,
        });
    }
}

/**
 * Handles subscription cancellation events.
 * Creates a recoverable churn record if within window.
 */
async function handleSubscriptionCanceled(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, customerId, subscriptionId, amountCents, rawPayload } = event;

    // Extract cancellation details
    const eventData = rawPayload as { data?: { object?: { cancellation_details?: { reason?: string; feedback?: string } } } };
    const cancellationDetails = eventData.data?.object?.cancellation_details;

    log('info', 'Subscription canceled', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        amountCents: amountCents || undefined,
        reason: cancellationDetails?.reason,
        feedback: cancellationDetails?.feedback,
    });

    // TODO: Create recoverable cancellation leak
    // Check if cancellation is within win-back window (e.g., 48 hours)
}

/**
 * Handles new subscription creation events.
 */
async function handleSubscriptionCreated(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, customerId, subscriptionId, amountCents, currency } = event;

    log('info', 'New subscription created', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        amountCents: amountCents || undefined,
        currency: currency || undefined,
    });

    // TODO: Add to monitoring queue
    // No immediate action needed, but good to log for MRR tracking
}

/**
 * Handles dispute events.
 * Creates urgent leak for evidence submission window.
 */
async function handleDispute(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, disputeId, chargeId, amountCents, currency, rawPayload } = event;

    // Extract dispute details
    const eventData = rawPayload as { data?: { object?: { status?: string; reason?: string } } };
    const disputeStatus = eventData.data?.object?.status;
    const disputeReason = eventData.data?.object?.reason;

    log('warn', 'Dispute event received', {
        eventId: stripeEventId,
        disputeId: disputeId || undefined,
        chargeId: chargeId || undefined,
        status: disputeStatus,
        reason: disputeReason,
        amountCents: amountCents || undefined,
        currency: currency || undefined,
    });

    // TODO: Create critical leak for dispute
    // Disputes have short response windows (usually 7-21 days)
}

/**
 * Handles card update events.
 * Resolves card_expiring leaks when card is auto-updated.
 */
async function handleCardUpdated(event: NormalizedEvent): Promise<void> {
    const { stripeEventId, customerId } = event;

    log('info', 'Card automatically updated', {
        eventId: stripeEventId,
        customerId: customerId || undefined,
    });

    // TODO: Resolve card_expiring leaks for this customer
}

// =============================================================================
// MAIN WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let normalizedEvent: NormalizedEvent | null = null;

    try {
        // Step 1: Read raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('stripe-signature');

        // Step 2: Verify webhook signature
        const verification = verifyWebhookSignature(rawBody, signature);

        if (!verification.success || !verification.event) {
            log('error', 'Signature verification failed', {
                error: verification.error,
                errorCode: verification.errorCode,
            });

            return NextResponse.json(
                {
                    error: verification.error,
                    code: verification.errorCode,
                },
                { status: 400 }
            );
        }

        const event = verification.event;
        const receivedAt = new Date();

        log('info', `Received webhook: ${event.type}`, {
            eventId: event.id,
            eventType: event.type,
            livemode: event.livemode,
        });

        // Step 3: Normalize the event
        normalizedEvent = normalizeStripeEvent(event, receivedAt);

        // Step 4: Check for duplicate (idempotency)
        const alreadyProcessed = await isEventProcessed(normalizedEvent.idempotencyKey);

        if (alreadyProcessed) {
            log('info', 'Event already processed (idempotency check)', {
                eventId: event.id,
                idempotencyKey: normalizedEvent.idempotencyKey,
            });

            // Return success to prevent Stripe from retrying
            return NextResponse.json({
                received: true,
                message: 'Event already processed',
                eventId: event.id,
            });
        }

        // Step 5: Store the event BEFORE processing (durability)
        await storeEvent(normalizedEvent);

        // Step 6: Check if this is an actionable event
        if (!ACTIONABLE_EVENTS.has(event.type)) {
            normalizedEvent.status = 'skipped';
            normalizedEvent.processedAt = new Date();
            normalizedEvent.processingDurationMs = Date.now() - startTime;

            await updateEvent(normalizedEvent);
            await markEventProcessed(normalizedEvent.idempotencyKey);

            log('info', 'Event stored but skipped (not actionable)', {
                eventId: event.id,
                eventType: event.type,
            });

            return NextResponse.json({
                received: true,
                message: 'Event stored but not actionable',
                eventId: event.id,
            });
        }

        // Step 7: Process the event
        normalizedEvent.status = 'processing';
        normalizedEvent.attemptCount += 1;
        normalizedEvent.lastAttemptAt = new Date();
        await updateEvent(normalizedEvent);

        try {
            await processEvent(normalizedEvent);

            // Step 8: Mark as completed
            normalizedEvent.status = 'completed';
            normalizedEvent.processedAt = new Date();
            normalizedEvent.processingDurationMs = Date.now() - startTime;

            await updateEvent(normalizedEvent);
            await markEventProcessed(normalizedEvent.idempotencyKey);

            log('info', 'Event processed successfully', {
                eventId: event.id,
                eventType: event.type,
                duration: normalizedEvent.processingDurationMs,
            });

            return NextResponse.json({
                received: true,
                message: 'Event processed successfully',
                eventId: event.id,
                processingTime: normalizedEvent.processingDurationMs,
            });
        } catch (processingError) {
            // Processing failed, but event is stored - can be retried
            const error = processingError as Error;

            normalizedEvent.status = 'failed';
            normalizedEvent.errorMessage = error.message;
            normalizedEvent.errorCode = error.name;
            normalizedEvent.processedAt = new Date();
            normalizedEvent.processingDurationMs = Date.now() - startTime;

            await updateEvent(normalizedEvent);

            log('error', 'Event processing failed', {
                eventId: event.id,
                eventType: event.type,
                error: error.message,
            });

            // Still return 200 to prevent infinite retries
            // The event is stored and can be manually reprocessed
            return NextResponse.json({
                received: true,
                message: 'Event received but processing failed',
                eventId: event.id,
                error: error.message,
            });
        }
    } catch (error) {
        const err = error as Error;
        const duration = Date.now() - startTime;

        log('error', 'Webhook handler error', {
            error: err.message,
            duration,
            eventId: normalizedEvent?.stripeEventId,
        });

        // Update event if we have one
        if (normalizedEvent) {
            normalizedEvent.status = 'failed';
            normalizedEvent.errorMessage = err.message;
            normalizedEvent.errorCode = 'HANDLER_ERROR';
            normalizedEvent.processedAt = new Date();
            normalizedEvent.processingDurationMs = duration;

            try {
                await updateEvent(normalizedEvent);
            } catch {
                // Ignore storage errors in error path
            }
        }

        return NextResponse.json(
            {
                error: 'Webhook handler failed',
                message: err.message,
            },
            { status: 500 }
        );
    }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'healthy',
        message: 'Stripe webhook endpoint is active',
        configured: !!WEBHOOK_SECRET,
        timestamp: new Date().toISOString(),
    });
}
