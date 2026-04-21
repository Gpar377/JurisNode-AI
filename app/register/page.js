'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const SPECIALIZATIONS = ['Motor Vehicle & Accident', 'Property & Real Estate', 'Family & Matrimonial', 'Consumer Protection', 'Employment & Labor', 'Corporate & Commercial', 'Cybercrime & Digital', 'Criminal Law'];

function RegisterForm() {
    const [role, setRole] = useState('CITIZEN');
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', state: '', city: '', barCouncilId: '', yearsExperience: '', bio: '' });
    const [specs, setSpecs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
    const toggleSpec = (s) => setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const body = { ...form, role, specializations: specs, yearsExperience: parseInt(form.yearsExperience) || 0 };
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            login(data.user, data.token);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally { setLoading(false); }
    };

    return (
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-card fade-in" style={{ maxWidth: 520 }}>
                    <h1>Join JurisNode</h1>
                    <p className="subtitle">Create your account and start navigating legal situations</p>

                    <div className="role-toggle">
                        <button className={role === 'CITIZEN' ? 'active' : ''} onClick={() => setRole('CITIZEN')}>👤 I&apos;m a Citizen</button>
                        <button className={role === 'LAWYER' ? 'active' : ''} onClick={() => setRole('LAWYER')}>⚖️ I&apos;m a Lawyer</button>
                    </div>

                    {error && <div className="disclaimer" style={{ marginBottom: 16, borderColor: 'var(--danger)', color: '#f87171' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input className="input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your full name" required />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" required />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input className="input" type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="input-group">
                                <label>State</label>
                                <select className="input" value={form.state} onChange={e => handleChange('state', e.target.value)} required>
                                    <option value="">Select state</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>City</label>
                                <input className="input" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="Your city" />
                            </div>
                        </div>

                        {role === 'LAWYER' && (
                            <>
                                <div className="input-group">
                                    <label>Bar Council ID</label>
                                    <input className="input" value={form.barCouncilId} onChange={e => handleChange('barCouncilId', e.target.value)} placeholder="BC/STATE/XXXX" />
                                </div>
                                <div className="input-group">
                                    <label>Years of Experience</label>
                                    <input className="input" type="number" value={form.yearsExperience} onChange={e => handleChange('yearsExperience', e.target.value)} placeholder="0" min={0} />
                                </div>
                                <div className="input-group">
                                    <label>Specializations</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {SPECIALIZATIONS.map(s => (
                                            <button type="button" key={s} onClick={() => toggleSpec(s)}
                                                className={`btn btn-sm ${specs.includes(s) ? 'btn-primary' : 'btn-outline'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Short Bio</label>
                                    <textarea className="input" value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="Brief description of your practice..." rows={3} />
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Creating account...' : `Register as ${role === 'CITIZEN' ? 'Citizen' : 'Lawyer'}`}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                        Already have an account? <Link href="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default function RegisterPage() {
    return <RegisterForm />;
}
