import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export default function DashboardLayout({
    children,
    title,
    subtitle,
    actions
}: DashboardLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content grid-pattern">
                <header className="page-header">
                    <div className="page-header-content">
                        <div>
                            <h1 className="page-title">{title}</h1>
                            {subtitle && <p className="page-subtitle">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex gap-3">{actions}</div>}
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
