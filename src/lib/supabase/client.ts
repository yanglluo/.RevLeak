import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                // Use PKCE flow which is more compatible with Next.js
                flowType: 'pkce',
                // Prevent auto-refresh issues during navigation
                detectSessionInUrl: false,
                // Use a consistent storage key
                storageKey: 'revleak-auth',
                // Disable auto-refresh to prevent AbortError during navigation
                autoRefreshToken: true,
                persistSession: true,
            },
        }
    );
}
