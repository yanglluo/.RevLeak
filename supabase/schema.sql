-- ==============================================================================
-- RevLeak Supabase Schema
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the required tables
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PROFILES TABLE
-- ==============================================================================
-- Stores user profile information and subscription status

CREATE TABLE IF NOT EXISTS profiles (
    -- Primary key (matches Supabase auth.users.id)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User information
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Stripe information
    stripe_customer_id TEXT UNIQUE,
    
    -- Subscription information
    subscription_id TEXT,
    subscription_status TEXT DEFAULT 'none' CHECK (
        subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')
    ),
    subscription_plan TEXT DEFAULT 'none' CHECK (
        subscription_plan IN ('none', 'starter', 'growth', 'enterprise')
    ),
    
    -- RevLeak settings
    stripe_api_key_encrypted TEXT,
    alert_email TEXT,
    email_notifications_enabled BOOLEAN DEFAULT true,
    slack_webhook_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================
-- Enable RLS on profiles table

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for new users)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ==============================================================================
-- This trigger automatically creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ==============================================================================
-- LEAKS TABLE (optional - for persistent leak storage)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS leaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Leak identification
    stripe_event_id TEXT,
    leak_type TEXT NOT NULL CHECK (
        leak_type IN (
            'payment_failed',
            'subscription_past_due',
            'card_expiring',
            'card_expired',
            'high_churn_risk',
            'downgrade_risk'
        )
    ),
    priority TEXT DEFAULT 'warning' CHECK (priority IN ('critical', 'warning', 'info')),
    
    -- Customer information
    customer_id TEXT NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    subscription_id TEXT,
    invoice_id TEXT,
    
    -- Leak details
    title TEXT NOT NULL,
    description TEXT,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    resolution_reason TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Intervention window
    intervention_window_hours DECIMAL DEFAULT 168, -- 7 days default
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for leaks table
CREATE INDEX IF NOT EXISTS idx_leaks_user_id ON leaks(user_id);
CREATE INDEX IF NOT EXISTS idx_leaks_status ON leaks(status);
CREATE INDEX IF NOT EXISTS idx_leaks_priority ON leaks(priority);
CREATE INDEX IF NOT EXISTS idx_leaks_customer_id ON leaks(customer_id);
CREATE INDEX IF NOT EXISTS idx_leaks_detected_at ON leaks(detected_at);

-- Enable RLS on leaks table
ALTER TABLE leaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own leaks
CREATE POLICY "Users can view own leaks"
    ON leaks FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own leaks
CREATE POLICY "Users can insert own leaks"
    ON leaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own leaks
CREATE POLICY "Users can update own leaks"
    ON leaks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- WEBHOOK EVENTS TABLE (optional - for event logging)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    stripe_event_id TEXT UNIQUE NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    
    -- Event details
    event_type TEXT NOT NULL,
    normalized_type TEXT,
    
    -- Related entities
    customer_id TEXT,
    subscription_id TEXT,
    invoice_id TEXT,
    charge_id TEXT,
    dispute_id TEXT,
    
    -- Processing
    status TEXT DEFAULT 'received' CHECK (
        status IN ('received', 'processing', 'completed', 'failed', 'skipped')
    ),
    error_message TEXT,
    error_code TEXT,
    
    -- Timing
    stripe_created_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_duration_ms INTEGER,
    
    -- Raw payload
    raw_payload JSONB,
    
    -- Metadata
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for webhook_events table
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);

-- ==============================================================================
-- SUMMARY
-- ==============================================================================
-- Tables created:
-- 1. profiles - User profiles with subscription status
-- 2. leaks - Revenue leak records (optional)
-- 3. webhook_events - Stripe webhook event log (optional)
--
-- Features:
-- - Row Level Security enabled
-- - Auto-create profile on signup
-- - Auto-update timestamps
-- - Proper indexes for performance
-- ==============================================================================
