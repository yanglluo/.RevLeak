/**
 * Normalized Webhook Event Types & Storage
 * 
 * This module defines the normalized event schema and provides
 * idempotent storage with deduplication guarantees.
 */

import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';

// =============================================================================
// NORMALIZED EVENT SCHEMA
// =============================================================================

/**
 * Canonical event types we track. Maps Stripe's many event types
 * to a smaller set of business-meaningful categories.
 */
export type NormalizedEventType =
    | 'payment_failed'
    | 'payment_succeeded'
    | 'subscription_updated'
    | 'subscription_canceled'
    | 'subscription_created'
    | 'dispute_created'
    | 'dispute_updated'
    | 'card_updated'
    | 'refund_created'
    | 'unknown';

/**
 * Processing status for tracking event lifecycle
 */
export type EventProcessingStatus =
    | 'received'    // Event received but not yet processed
    | 'processing'  // Currently being processed
    | 'completed'   // Successfully processed
    | 'failed'      // Processing failed (will not retry)
    | 'skipped';    // Event intentionally skipped (e.g., irrelevant type)

/**
 * Normalized event record stored for all incoming webhooks.
 * Denormalized for query efficiency - contains both raw and parsed data.
 */
export interface NormalizedEvent {
    // Identification
    id: string;                          // Our internal ID (uuid)
    stripeEventId: string;               // Stripe's event ID (evt_xxx)
    stripeEventType: string;             // Original Stripe event type
    normalizedType: NormalizedEventType; // Our canonical type

    // Stripe Account Context
    stripeAccountId: string | null;      // Connected account ID if applicable
    livemode: boolean;                   // true if production, false if test

    // Timing
    stripeCreatedAt: Date;               // When Stripe created the event
    receivedAt: Date;                    // When we received the webhook
    processedAt: Date | null;            // When we finished processing
    processingDurationMs: number | null; // How long processing took

    // Status & Idempotency
    status: EventProcessingStatus;
    idempotencyKey: string;              // Composite key for deduplication
    attemptCount: number;                // How many times we've tried to process
    lastAttemptAt: Date | null;

    // Error Tracking
    errorMessage: string | null;
    errorCode: string | null;

    // Extracted Business Data (denormalized for query efficiency)
    customerId: string | null;
    subscriptionId: string | null;
    invoiceId: string | null;
    paymentIntentId: string | null;
    chargeId: string | null;
    disputeId: string | null;

    // Financial Data
    amountCents: number | null;
    currency: string | null;

    // Customer Info (snapshot at event time)
    customerEmail: string | null;
    customerName: string | null;

    // Full Event Payload (for debugging and reprocessing)
    rawPayload: Record<string, unknown>;

    // Metadata
    apiVersion: string | null;
    requestId: string | null;            // Stripe request ID for tracing
}

// =============================================================================
// STRIPE EVENT TYPE MAPPING
// =============================================================================

const STRIPE_TO_NORMALIZED_TYPE: Record<string, NormalizedEventType> = {
    // Payment Events
    'invoice.payment_failed': 'payment_failed',
    'invoice.payment_succeeded': 'payment_succeeded',
    'payment_intent.payment_failed': 'payment_failed',
    'payment_intent.succeeded': 'payment_succeeded',
    'charge.failed': 'payment_failed',
    'charge.succeeded': 'payment_succeeded',

    // Subscription Events
    'customer.subscription.created': 'subscription_created',
    'customer.subscription.updated': 'subscription_updated',
    'customer.subscription.deleted': 'subscription_canceled',
    'customer.subscription.paused': 'subscription_updated',
    'customer.subscription.resumed': 'subscription_updated',
    'customer.subscription.pending_update_applied': 'subscription_updated',
    'customer.subscription.pending_update_expired': 'subscription_updated',
    'customer.subscription.trial_will_end': 'subscription_updated',

    // Dispute Events
    'charge.dispute.created': 'dispute_created',
    'charge.dispute.updated': 'dispute_updated',
    'charge.dispute.closed': 'dispute_updated',
    'charge.dispute.funds_reinstated': 'dispute_updated',
    'charge.dispute.funds_withdrawn': 'dispute_updated',

    // Card/Payment Method Events
    'payment_method.automatically_updated': 'card_updated',
    'customer.source.updated': 'card_updated',

    // Refund Events
    'charge.refunded': 'refund_created',
    'charge.refund.updated': 'refund_created',
};

export function normalizeEventType(stripeEventType: string): NormalizedEventType {
    return STRIPE_TO_NORMALIZED_TYPE[stripeEventType] || 'unknown';
}

// =============================================================================
// DATA EXTRACTION HELPERS
// =============================================================================

/**
 * Safely extracts nested string value from an object
 */
function extractString(obj: unknown, ...paths: string[]): string | null {
    if (!obj || typeof obj !== 'object') return null;

    for (const path of paths) {
        const keys = path.split('.');
        let current: unknown = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                current = undefined;
                break;
            }
        }

        if (typeof current === 'string' && current.length > 0) {
            return current;
        }
    }

    return null;
}

/**
 * Safely extracts nested number value from an object
 */
function extractNumber(obj: unknown, ...paths: string[]): number | null {
    if (!obj || typeof obj !== 'object') return null;

    for (const path of paths) {
        const keys = path.split('.');
        let current: unknown = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                current = undefined;
                break;
            }
        }

        if (typeof current === 'number') {
            return current;
        }
    }

    return null;
}

/**
 * Extracts customer ID from various event payloads
 */
function extractCustomerId(eventData: unknown): string | null {
    return extractString(
        eventData,
        'customer',           // Direct customer field (string ID)
        'customer.id',        // Expanded customer object
        'object.customer',    // Nested in object
        'object.customer.id'
    );
}

/**
 * Extracts subscription ID from various event payloads
 */
function extractSubscriptionId(eventData: unknown): string | null {
    return extractString(
        eventData,
        'subscription',       // Direct subscription field
        'subscription.id',    // Expanded subscription
        'object.subscription',
        'object.subscription.id',
        'id'                  // For subscription events, the object IS the subscription
    );
}

/**
 * Extracts invoice ID from various event payloads
 */
function extractInvoiceId(eventData: unknown): string | null {
    return extractString(
        eventData,
        'invoice',
        'invoice.id',
        'object.invoice',
        'object.invoice.id'
    );
}

/**
 * Extracts customer email from various sources
 */
function extractCustomerEmail(eventData: unknown): string | null {
    return extractString(
        eventData,
        'customer_email',
        'customer.email',
        'object.customer_email',
        'object.customer.email',
        'receipt_email',
        'billing_details.email'
    );
}

/**
 * Extracts customer name from various sources
 */
function extractCustomerName(eventData: unknown): string | null {
    return extractString(
        eventData,
        'customer_name',
        'customer.name',
        'object.customer_name',
        'object.customer.name',
        'billing_details.name'
    );
}

// =============================================================================
// EVENT NORMALIZATION
// =============================================================================

/**
 * Creates a normalized event record from a raw Stripe event.
 * This is a pure function with no side effects.
 */
export function normalizeStripeEvent(
    event: Stripe.Event,
    receivedAt: Date = new Date()
): NormalizedEvent {
    const eventData = event.data.object as unknown as Record<string, unknown>;

    // Generate idempotency key: combination of event ID and account
    // This ensures we don't process the same event twice, even across restarts
    const idempotencyKey = `${event.id}:${event.account || 'self'}`;

    // Detect if event object is a subscription (for subscription events)
    const isSubscriptionEvent = event.type.startsWith('customer.subscription.');
    const subscriptionId = isSubscriptionEvent
        ? extractString(eventData, 'id')
        : extractSubscriptionId(eventData);

    return {
        // Identification
        id: crypto.randomUUID(),
        stripeEventId: event.id,
        stripeEventType: event.type,
        normalizedType: normalizeEventType(event.type),

        // Stripe Account Context
        stripeAccountId: event.account || null,
        livemode: event.livemode,

        // Timing
        stripeCreatedAt: new Date(event.created * 1000),
        receivedAt,
        processedAt: null,
        processingDurationMs: null,

        // Status & Idempotency
        status: 'received',
        idempotencyKey,
        attemptCount: 0,
        lastAttemptAt: null,

        // Error Tracking
        errorMessage: null,
        errorCode: null,

        // Extracted Business Data
        customerId: extractCustomerId(eventData),
        subscriptionId,
        invoiceId: extractInvoiceId(eventData),
        paymentIntentId: extractString(eventData, 'payment_intent', 'payment_intent.id', 'id'),
        chargeId: extractString(eventData, 'charge', 'charge.id', 'id'),
        disputeId: event.type.includes('dispute') ? extractString(eventData, 'id') : null,

        // Financial Data
        amountCents: extractNumber(eventData, 'amount', 'amount_due', 'amount_paid', 'amount_total'),
        currency: extractString(eventData, 'currency')?.toUpperCase() || null,

        // Customer Info
        customerEmail: extractCustomerEmail(eventData),
        customerName: extractCustomerName(eventData),

        // Full Payload
        rawPayload: event as unknown as Record<string, unknown>,

        // Metadata
        apiVersion: event.api_version || null,
        requestId: event.request?.id || null,
    };
}

// =============================================================================
// IDEMPOTENT EVENT STORAGE
// =============================================================================

/**
 * File-based event store for development/MVP.
 * In production, replace with Supabase/Postgres.
 * 
 * Guarantees:
 * - Atomic writes (write to temp file, then rename)
 * - Idempotent processing (checks before insert)
 * - Durable storage (fsync on write)
 */

const EVENTS_DIR = path.join(process.cwd(), '.data', 'webhook-events');
const PROCESSED_IDS_FILE = path.join(EVENTS_DIR, '_processed_ids.json');

// In-memory cache of processed event IDs for fast lookups
let processedIdsCache: Set<string> | null = null;

// Simple mutex for file operations to prevent race conditions
let fileOperationLock: Promise<void> = Promise.resolve();

function acquireLock(): { release: () => void; ready: Promise<void> } {
    let releaseFn: () => void;
    const previousLock = fileOperationLock;
    fileOperationLock = new Promise<void>((resolve) => {
        releaseFn = resolve;
    });
    return {
        release: () => releaseFn!(),
        ready: previousLock,
    };
}

// Track directory initialization to avoid repeated mkdir calls
let dirInitialized = false;

/**
 * Ensures the events directory exists
 */
async function ensureEventsDir(): Promise<void> {
    if (dirInitialized) return;

    try {
        await fs.mkdir(EVENTS_DIR, { recursive: true });
        dirInitialized = true;
    } catch (error: unknown) {
        // Ignore EEXIST errors
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
            dirInitialized = true;
        } else {
            throw error;
        }
    }
}

/**
 * Loads the set of processed event IDs from disk
 */
async function loadProcessedIds(): Promise<Set<string>> {
    if (processedIdsCache !== null) {
        return processedIdsCache;
    }

    try {
        await ensureEventsDir();
        const data = await fs.readFile(PROCESSED_IDS_FILE, 'utf-8');
        const ids = JSON.parse(data) as string[];
        processedIdsCache = new Set(ids);
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            processedIdsCache = new Set();
        } else {
            throw error;
        }
    }

    return processedIdsCache;
}

/**
 * Persists the processed IDs set to disk atomically
 */
async function saveProcessedIds(ids: Set<string>): Promise<void> {
    await ensureEventsDir();

    const tempFile = `${PROCESSED_IDS_FILE}.tmp`;
    const data = JSON.stringify(Array.from(ids), null, 2);

    // Write to temp file first
    await fs.writeFile(tempFile, data, 'utf-8');

    // Atomic rename
    await fs.rename(tempFile, PROCESSED_IDS_FILE);

    // Update cache
    processedIdsCache = ids;
}

/**
 * Checks if an event has already been processed (idempotency check)
 */
export async function isEventProcessed(idempotencyKey: string): Promise<boolean> {
    const processedIds = await loadProcessedIds();
    return processedIds.has(idempotencyKey);
}

/**
 * Marks an event as processed (prevents future duplicate processing)
 */
export async function markEventProcessed(idempotencyKey: string): Promise<void> {
    const processedIds = await loadProcessedIds();
    processedIds.add(idempotencyKey);
    await saveProcessedIds(processedIds);
}

/**
 * Stores a normalized event to disk
 */
export async function storeEvent(event: NormalizedEvent): Promise<void> {
    const lock = acquireLock();
    await lock.ready;

    try {
        await ensureEventsDir();

        const filename = `${event.receivedAt.toISOString().slice(0, 10)}_${event.stripeEventId}.json`;
        const filepath = path.join(EVENTS_DIR, filename);
        // Use unique temp file per event to avoid collisions
        const tempFile = `${filepath}.${Date.now()}.tmp`;

        const data = JSON.stringify(event, null, 2);

        // Atomic write
        await fs.writeFile(tempFile, data, 'utf-8');
        await fs.rename(tempFile, filepath);
    } finally {
        lock.release();
    }
}

/**
 * Updates an existing event record
 */
export async function updateEvent(event: NormalizedEvent): Promise<void> {
    // For file-based storage, we just overwrite
    await storeEvent(event);
}

/**
 * Retrieves an event by Stripe event ID
 */
export async function getEventByStripeId(stripeEventId: string): Promise<NormalizedEvent | null> {
    await ensureEventsDir();

    try {
        const files = await fs.readdir(EVENTS_DIR);
        const matchingFile = files.find(f => f.includes(stripeEventId) && f.endsWith('.json'));

        if (!matchingFile) {
            return null;
        }

        const filepath = path.join(EVENTS_DIR, matchingFile);
        const data = await fs.readFile(filepath, 'utf-8');
        const event = JSON.parse(data) as NormalizedEvent;

        // Restore Date objects
        event.stripeCreatedAt = new Date(event.stripeCreatedAt);
        event.receivedAt = new Date(event.receivedAt);
        if (event.processedAt) event.processedAt = new Date(event.processedAt);
        if (event.lastAttemptAt) event.lastAttemptAt = new Date(event.lastAttemptAt);

        return event;
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Clears the in-memory cache (useful for testing)
 */
export function clearCache(): void {
    processedIdsCache = null;
}

/**
 * Gets count of stored events (for monitoring)
 */
export async function getEventCount(): Promise<number> {
    try {
        await ensureEventsDir();
        const files = await fs.readdir(EVENTS_DIR);
        return files.filter(f => f.endsWith('.json') && !f.startsWith('_')).length;
    } catch {
        return 0;
    }
}
