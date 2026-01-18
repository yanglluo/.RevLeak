// Zustand store for global application state

import { create } from 'zustand';
import type { DetectedLeak } from './leak-detector';
import type { DashboardStats, Customer, Subscription, Settings } from './types';

interface AppState {
    // Auth
    isAuthenticated: boolean;
    user: { id: string; email: string; name?: string } | null;
    setUser: (user: { id: string; email: string; name?: string } | null) => void;

    // Stripe Connection
    stripeConnected: boolean;
    setStripeConnected: (connected: boolean) => void;

    // Leaks
    leaks: DetectedLeak[];
    setLeaks: (leaks: DetectedLeak[]) => void;
    addLeak: (leak: DetectedLeak) => void;
    removeLeak: (id: string) => void;

    // Stats
    stats: DashboardStats;
    setStats: (stats: DashboardStats) => void;

    // Customers
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;

    // Subscriptions
    subscriptions: Subscription[];
    setSubscriptions: (subscriptions: Subscription[]) => void;

    // Settings
    settings: Settings | null;
    setSettings: (settings: Settings) => void;

    // UI State
    isSyncing: boolean;
    setSyncing: (syncing: boolean) => void;
    lastSyncAt: Date | null;
    setLastSyncAt: (date: Date) => void;

    // Sidebar
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const defaultStats: DashboardStats = {
    revenueAtRisk: 0,
    revenueSaved: 0,
    activeLeaks: 0,
    resolvedLeaks: 0,
    detectionRate: 99.7,
    avgResolutionTime: 0,
};

export const useAppStore = create<AppState>((set) => ({
    // Auth
    isAuthenticated: false,
    user: null,
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    // Stripe
    stripeConnected: false,
    setStripeConnected: (connected) => set({ stripeConnected: connected }),

    // Leaks
    leaks: [],
    setLeaks: (leaks) => set({ leaks }),
    addLeak: (leak) => set((state) => ({ leaks: [...state.leaks, leak] })),
    removeLeak: (id) => set((state) => ({ leaks: state.leaks.filter((l) => l.id !== id) })),

    // Stats
    stats: defaultStats,
    setStats: (stats) => set({ stats }),

    // Customers
    customers: [],
    setCustomers: (customers) => set({ customers }),

    // Subscriptions
    subscriptions: [],
    setSubscriptions: (subscriptions) => set({ subscriptions }),

    // Settings
    settings: null,
    setSettings: (settings) => set({ settings }),

    // UI State
    isSyncing: false,
    setSyncing: (syncing) => set({ isSyncing: syncing }),
    lastSyncAt: null,
    setLastSyncAt: (date) => set({ lastSyncAt: date }),

    // Sidebar
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
