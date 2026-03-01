'use client';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/Toast';

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
    );
}
