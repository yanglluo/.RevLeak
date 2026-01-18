import { Suspense } from 'react';
import SuccessClient from './SuccessClient';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
        }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                <p className="text-lg mt-4">Loading...</p>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessClient />
        </Suspense>
    );
}
