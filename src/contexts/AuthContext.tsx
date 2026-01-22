'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    stripe_customer_id?: string;
    subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
    subscription_plan?: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isPaid: boolean;
    isConfigured: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if the values are actually set (not placeholder values)
    const isUrlValid = url && url.startsWith('http') && !url.includes('your_supabase');
    const isKeyValid = key && key.length > 20 && !key.includes('your_supabase');

    if (!isUrlValid || !isKeyValid) {
        console.warn('Supabase Config Issues:', {
            urlPresent: !!url,
            urlValid: isUrlValid,
            keyPresent: !!key,
            keyValid: isKeyValid,
            urlValue: url ? 'Set (Hidden)' : 'Missing',
        });
    }

    return Boolean(isUrlValid && isKeyValid);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supabase, setSupabase] = useState<any>(null);

    const isConfigured = isSupabaseConfigured();

    // Check if user has an active paid subscription
    const isPaid = profile?.subscription_status === 'active' ||
        profile?.subscription_status === 'trialing';

    // Initialize Supabase client only if configured
    useEffect(() => {
        if (isConfigured) {
            import('@/lib/supabase/client').then(({ createClient }) => {
                const client = createClient();
                setSupabase(client);
            }).catch(err => {
                console.error('Failed to initialize Supabase:', err);
                setIsLoading(false);
            });
        } else {
            // Not configured - skip auth initialization
            console.log('Supabase not configured - auth disabled');
            setIsLoading(false);
        }
    }, [isConfigured]);

    // Fetch user profile from database
    const fetchProfile = async (userId: string) => {
        if (!supabase) return null;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data as UserProfile | null;
        } catch (err) {
            console.error('Profile fetch error:', err);
            return null;
        }
    };

    // Create initial profile for new users
    const createProfile = async (userId: string, email: string, fullName?: string) => {
        if (!supabase) return null;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    full_name: fullName || null,
                    subscription_status: 'none',
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                return null;
            }

            return data as UserProfile;
        } catch (err) {
            console.error('Profile creation error:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user && supabase) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
        }
    };

    // Initialize auth state when Supabase is ready
    useEffect(() => {
        if (!supabase) return;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (currentSession?.user) {
                    setSession(currentSession);
                    setUser(currentSession.user);

                    let profileData = await fetchProfile(currentSession.user.id);

                    // Create profile if it doesn't exist
                    if (!profileData) {
                        profileData = await createProfile(
                            currentSession.user.id,
                            currentSession.user.email || ''
                        );
                    }

                    setProfile(profileData);
                }
            } catch (error: any) {
                // Ignore AbortError - this happens during navigation and is expected
                if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
                    console.log('Auth init aborted (navigation occurred)');
                    return;
                }
                console.error('Auth init error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, newSession: Session | null) => {
                setSession(newSession);
                setUser(newSession?.user || null);

                if (newSession?.user) {
                    let profileData = await fetchProfile(newSession.user.id);

                    if (!profileData && event === 'SIGNED_IN') {
                        profileData = await createProfile(
                            newSession.user.id,
                            newSession.user.email || ''
                        );
                    }

                    setProfile(profileData);
                } else {
                    setProfile(null);
                }

                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            return { error: 'Authentication not configured. Please set up Supabase.' };
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: error.message };
            }

            return {};
        } catch (err: any) {
            return { error: err.message || 'Sign in failed' };
        }
    };

    const signUp = async (email: string, password: string, fullName?: string) => {
        if (!supabase) {
            return { error: 'Authentication not configured. Please set up Supabase.' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                return { error: error.message };
            }

            // Create profile immediately after signup
            if (data.user) {
                await createProfile(data.user.id, email, fullName);
            }

            return {};
        } catch (err: any) {
            return { error: err.message || 'Sign up failed' };
        }
    };

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isPaid,
                isConfigured,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
