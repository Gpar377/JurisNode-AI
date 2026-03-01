'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const SPECIALIZATIONS = ['Motor Vehicle & Accident', 'Property & Real Estate', 'Family & Matrimonial', 'Consumer Protection', 'Employment & Labor', 'Corporate & Commercial', 'Cybercrime & Digital', 'Criminal Law'];

function LawyerSearch() {
    const { user, authFetch, loading: authLoading } = useAuth();
    const toast = useToast();
    const searchParams = useSearchParams();
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        state: searchParams.get('state') || '',
        specialization: searchParams.get('category') || '',
    });
    const [assigningTo, setAssigningTo] = useState(null);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState('');
    const [roleType, setRoleType] = useState('LOCAL');

    useEffect(() => {
        loadLawyers();
    }, [filters]);

    useEffect(() => {
        if (user && user.role === 'CITIZEN') {
            authFetch('/api/cases').then(r => r.json()).then(d => setCases(d.cases || []));
        }
    }, [user]);

    const loadLawyers = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.state) params.set('state', filters.state);
        if (filters.specialization) params.set('specialization', filters.specialization);
        try {
            const res = await fetch(`/api/lawyers?${params}`);
            const data = await res.json();
            setLawyers(data.lawyers || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const assignLawyer = async (lawyerId) => {
        if (!selectedCase) return;
        try {
            const res = await authFetch(`/api/cases/${selectedCase}/assign`, {
                method: 'POST',
                body: JSON.stringify({ lawyerId: lawyerId, roleType })
            });
            if (res.ok) {
                setAssigningTo(null);
                setSelectedCase('');
                toast.success('Lawyer assignment request sent!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to assign lawyer');
            }
        } catch (err) { toast.error('Error assigning lawyer'); }
    };

    return (
        <>
            <Navbar />
            <div className="container page fade-in">
                <div style={{ marginBottom: 30 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }}>⚖️ Find a Lawyer</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                        Search verified lawyers by location and specialization
                    </p>
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label>State</label>
                            <select className="input" value={filters.state} onChange={e => setFilters(prev => ({ ...prev, state: e.target.value }))}>
                                <option value="">All States</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label>Specialization</label>
                            <select className="input" value={filters.specialization} onChange={e => setFilters(prev => ({ ...prev, specialization: e.target.value }))}>
                                <option value="">All Specializations</option>
                                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-outline" onClick={() => setFilters({ state: '', specialization: '' })}>
                            Clear
                        </button>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                ) : lawyers.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">⚖️</div>
                        <h3>No lawyers found</h3>
                        <p>Try adjusting your search filters</p>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {lawyers.map(lawyer => (
                            <div key={lawyer.id} className="lawyer-card">
                                <div className="lawyer-name">{lawyer.user?.name}</div>
                                <div className="lawyer-spec">
                                    {JSON.parse(lawyer.specializations || '[]').join(', ')}
                                </div>
                                <div className="lawyer-info">📍 {lawyer.state}{lawyer.city ? `, ${lawyer.city}` : ''}</div>
                                <div className="lawyer-info">🏛️ {lawyer.yearsExperience} years experience</div>
                                {lawyer.barCouncilId && <div className="lawyer-info">📋 Bar: {lawyer.barCouncilId}</div>}
                                <div className="lawyer-rating" style={{ margin: '8px 0' }}>
                                    {'★'.repeat(Math.round(lawyer.rating || 0))}{'☆'.repeat(5 - Math.round(lawyer.rating || 0))} {(lawyer.rating || 0).toFixed(1)}
                                </div>
                                {lawyer.bio && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{lawyer.bio}</p>}
                                {lawyer.verified && <span className="badge badge-accepted" style={{ marginBottom: 12 }}>✓ Verified</span>}

                                {user && user.role === 'CITIZEN' && (
                                    <>
                                        {assigningTo === lawyer.id ? (
                                            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                                <div className="input-group" style={{ marginBottom: 8 }}>
                                                    <label>Select Case</label>
                                                    <select className="input" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                                                        <option value="">Choose a case</option>
                                                        {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                    </select>
                                                </div>
                                                <div className="input-group" style={{ marginBottom: 8 }}>
                                                    <label>Role Type</label>
                                                    <select className="input" value={roleType} onChange={e => setRoleType(e.target.value)}>
                                                        <option value="LOCAL">Local Lawyer</option>
                                                        <option value="PRIMARY">Primary Lawyer</option>
                                                        <option value="CONSULTANT">Consultant</option>
                                                    </select>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn btn-sm btn-primary" onClick={() => assignLawyer(lawyer.id)}>Assign</button>
                                                    <button className="btn btn-sm btn-outline" onClick={() => setAssigningTo(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button className="btn btn-sm btn-accent" style={{ marginTop: 12 }} onClick={() => setAssigningTo(lawyer.id)}>
                                                Assign to Case
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default function LawyersPage() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>}>
            <LawyerSearch />
        </Suspense>
    );
}
