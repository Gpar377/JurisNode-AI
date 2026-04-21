'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

function NewCaseForm() {
    const { user, authFetch, loading: authLoading } = useAuth();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ categoryId: '', title: '', description: '', stateOfIncident: '', city: '', isUrgent: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'CITIZEN') { router.push('/login'); return; }
        fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    }, [user, authLoading]);

    const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await authFetch('/api/cases', {
                method: 'POST', body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push(`/cases/${data.case.id}`);
        } catch (err) {
            setError(err.message);
        } finally { setLoading(false); }
    };

    if (authLoading || !user) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;

    return (
        <>
            <Navbar />
            <div className="container page fade-in" style={{ maxWidth: 700 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📝 Create New Case</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
                    Describe your legal situation. Our AI will immediately classify it and provide procedural guidance.
                </p>

                {error && <div className="disclaimer" style={{ marginBottom: 16, borderColor: 'var(--danger)', color: '#f87171' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="card">
                    <div className="input-group">
                        <label>Legal Category</label>
                        <div className="grid grid-4" style={{ gap: 10 }}>
                            {categories.map(cat => (
                                <button type="button" key={cat.id} onClick={() => handleChange('categoryId', cat.id)}
                                    className="cat-card" style={{
                                        padding: 16, textAlign: 'center',
                                        borderColor: form.categoryId === cat.id ? 'var(--primary-lighter)' : undefined,
                                        background: form.categoryId === cat.id ? 'rgba(59,130,246,0.1)' : undefined,
                                    }}>
                                    <span style={{ fontSize: 28 }}>{cat.icon}</span>
                                    <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{cat.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Case Title</label>
                        <input className="input" value={form.title} onChange={e => handleChange('title', e.target.value)}
                            placeholder="Brief title for your case (e.g., 'Road accident in Chennai')" required />
                    </div>

                    <div className="input-group">
                        <label>Describe What Happened</label>
                        <textarea className="input" value={form.description} onChange={e => handleChange('description', e.target.value)}
                            placeholder="Describe the incident in detail. Include dates, locations, parties involved, and any actions already taken..."
                            rows={5} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                            <label>State of Incident</label>
                            <select className="input" value={form.stateOfIncident} onChange={e => handleChange('stateOfIncident', e.target.value)} required>
                                <option value="">Select state</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>City</label>
                            <input className="input" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="City where it happened" />
                        </div>
                    </div>

                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="urgent" checked={form.isUrgent} onChange={e => handleChange('isUrgent', e.target.checked)}
                            style={{ width: 20, height: 20, accentColor: 'var(--danger)' }} />
                        <label htmlFor="urgent" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
                            🔴 This is urgent (immediate action needed)
                        </label>
                    </div>

                    <div className="disclaimer" style={{ marginBottom: 20 }}>
                        <strong>⚠️ Disclaimer:</strong> JurisNode provides legal procedural information only.
                        It does not constitute legal advice. Always consult a qualified lawyer for specific guidance.
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Creating case...' : 'Create Case & Get AI Guidance'}
                    </button>
                </form>
            </div>
        </>
    );
}

export default function NewCasePage() {
    return <NewCaseForm />;
}
