'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href={user ? '/dashboard' : '/'} className="logo">
                    <span className="logo-icon">⚖️</span>
                    Lex<span>Link</span>
                </Link>

                <div className="nav-links">
                    {user ? (
                        <>
                            <Link href="/dashboard" className="nav-link">Dashboard</Link>
                            {user.role === 'CITIZEN' && (
                                <Link href="/cases/new" className="nav-link">New Case</Link>
                            )}
                            <Link href="/lawyers" className="nav-link">Find Lawyers</Link>
                            <div className="nav-user">
                                <div>
                                    <div>{user.name}</div>
                                    <div className="nav-user-role">{user.role}</div>
                                </div>
                                <button onClick={handleLogout} className="btn btn-sm btn-outline">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-sm btn-outline">Login</Link>
                            <Link href="/register" className="btn btn-sm btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
