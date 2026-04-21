'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';


function CaseDetail() {
    const { user, authFetch, loading: authLoading } = useAuth();
    const toast = useToast();
    const params = useParams();
    const router = useRouter();
    const [caseData, setCaseData] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const messagesEnd = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        loadCase();
    }, [user, authLoading, params.id]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const loadCase = async () => {
        try {
            const res = await authFetch(`/api/cases/${params.id}`);
            if (!res.ok) { router.push('/dashboard'); return; }
            const data = await res.json();
            setCaseData(data.case);
            setMessages(data.case?.messages || []);
            setTimeline(data.case?.timeline || []);
            setDocuments(data.case?.documents || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || sending) return;
        // Optimistic update — show user message immediately
        const tempMsg = { senderType: 'USER', content: chatInput, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        const input = chatInput;
        setChatInput('');
        setSending(true);
        try {
            const res = await authFetch(`/api/cases/${params.id}/chat`, {
                method: 'POST', body: JSON.stringify({ message: input })
            });
            const data = await res.json();
            if (res.ok) {
                // Replace temp message + add AI response
                setMessages(prev => [...prev.slice(0, -1), data.userMessage, data.aiResponse]);
            } else {
                toast.error('Failed to send message');
                setMessages(prev => prev.slice(0, -1));
                setChatInput(input);
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error');
            setMessages(prev => prev.slice(0, -1));
            setChatInput(input);
        }
        setSending(false);
    };

    const uploadDocument = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', 'EVIDENCE');

            const res = await fetch(`/api/cases/${params.id}/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jurisnode_auth') ? JSON.parse(localStorage.getItem('jurisnode_auth')).token : ''}` },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                setDocuments(prev => [data.document, ...prev]);
                toast.success(`Uploaded: ${file.name}`);
            } else {
                toast.error('Upload failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload error');
        }
        setUploading(false);
    };

    const updateStatus = async (newStatus) => {
        try {
            const res = await authFetch(`/api/cases/${params.id}`, {
                method: 'PUT', body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setCaseData(prev => ({ ...prev, status: newStatus }));
                toast.success(`Case marked as ${newStatus.replace('_', ' ').toLowerCase()}`);
                loadCase(); // Refresh timeline
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const getStatusBadge = (status) => {
        const map = { OPEN: 'badge-open', NEEDS_LAWYER: 'badge-urgent', IN_PROGRESS: 'badge-in-progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' };
        return map[status] || 'badge-open';
    };


    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (authLoading || loading || !caseData) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;

    return (
        <>
            <Navbar />
            <div className="container page fade-in">
                {/* Case Header */}
                <div className="case-header">
                    <div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <Link href="/dashboard" className="btn btn-sm btn-outline">← Back</Link>
                            <span className={`badge ${getStatusBadge(caseData.status)}`}>{caseData.status.replace('_', ' ')}</span>
                            {caseData.isUrgent && <span className="badge badge-urgent">🔴 URGENT</span>}
                        </div>
                        <h1 className="case-title">{caseData.title}</h1>
                        <div className="case-meta">
                            {caseData.category?.icon} {caseData.category?.name} • 📍 {caseData.stateOfIncident}{caseData.city ? `, ${caseData.city}` : ''} • Created {new Date(caseData.createdAt).toLocaleDateString('en-IN')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {user.role === 'CITIZEN' && caseData.status !== 'RESOLVED' && caseData.status !== 'CLOSED' && (
                            <>
                                <Link href={`/lawyers?state=${caseData.stateOfIncident}&category=${caseData.category?.name || ''}`} className="btn btn-accent">
                                    Find a Lawyer
                                </Link>
                                <button className="btn btn-success btn-sm" onClick={() => updateStatus('RESOLVED')}>
                                    ✅ Mark Resolved
                                </button>
                            </>
                        )}
                        {caseData.status === 'RESOLVED' && user.role === 'CITIZEN' && (
                            <button className="btn btn-outline btn-sm" onClick={() => updateStatus('CLOSED')}>
                                🔒 Close Case
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {['chat', 'timeline', 'documents', 'lawyers', 'details'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {{ chat: '💬 AI Chat', timeline: '📅 Timeline', documents: `📄 Documents${documents.length ? ` (${documents.length})` : ''}`, lawyers: '⚖️ Lawyers', details: '📋 Details' }[tab]}
                        </button>
                    ))}
                </div>

                {/* AI Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="chat-container" style={{ height: 600 }}>
                        <div className="chat-header">
                            🤖 JurisNode AI Legal Navigator
                            <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 'auto' }}>Procedural guidance only • Not legal advice</span>
                        </div>
                        <div className="chat-messages">
                            {messages.length === 0 && !sending && (
                                <div className="empty-state" style={{ padding: 20 }}>
                                    <div className="icon">💬</div>
                                    <h3>Start a conversation</h3>
                                    <p>Ask anything about your case. AI will guide you through procedures and next steps.</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`chat-msg ${msg.senderType === 'USER' ? 'user' : msg.senderType === 'AI' ? 'ai' : 'lawyer'}`}>
                                    <div className="sender">
                                        {msg.senderType === 'AI' ? '🤖 JurisNode AI' : msg.senderType === 'LAWYER' ? `⚖️ ${msg.senderName || 'Lawyer'}` : `👤 You`}
                                    </div>
                                    <div className="ai-markdown-content text-sm leading-relaxed space-y-2">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                                        {new Date(msg.createdAt || msg.timestamp).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                            {sending && (
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-dim)' }}>AI is thinking...</span>
                                </div>
                            )}
                            <div ref={messagesEnd} />
                        </div>
                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                                placeholder="Ask about procedures, documents, next steps..." disabled={sending} />
                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                {sending ? '...' : 'Send'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <div className="card">
                        <h3 style={{ marginBottom: 20 }}>📅 Case Timeline</h3>
                        {timeline.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">📅</div>
                                <h3>No events yet</h3>
                            </div>
                        ) : (
                            <div className="timeline">
                                {timeline.map((ev, i) => (
                                    <div key={i} className={`timeline-item ${ev.eventType === 'AI_RESPONSE' ? 'ai' : ev.eventType === 'STATUS_CHANGE' ? 'status' : ev.eventType === 'LAWYER_ASSIGNED' ? 'lawyer' : ''}`}>
                                        <div className="timeline-type">{ev.eventType.replace(/_/g, ' ')}</div>
                                        <div className="timeline-desc">{ev.eventDescription}</div>
                                        <div className="timeline-time">{new Date(ev.createdAt || ev.timestamp).toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="card">
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h3>📄 Documents ({documents.length})</h3>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                                onChange={e => { if (e.target.files[0]) uploadDocument(e.target.files[0]); }} />
                            <button className="btn btn-sm btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? '⏳ Uploading...' : '📎 Upload File'}
                            </button>
                        </div>

                        {/* Upload Area */}
                        <div className="upload-area" style={{ marginBottom: 20 }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                            onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); if (e.dataTransfer.files[0]) uploadDocument(e.dataTransfer.files[0]); }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                            <div style={{ fontWeight: 600 }}>Drag & drop files here or click to browse</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>FIR copies, medical reports, legal notices, contracts, photos</div>
                        </div>

                        {documents.length === 0 ? (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <div className="icon">📄</div>
                                <h3>No documents yet</h3>
                                <p>Upload FIR copies, medical reports, and other evidence.</p>
                            </div>
                        ) : (
                            documents.map((doc, i) => (
                                <div key={i} className="doc-item">
                                    <div>
                                        <div className="doc-name">{doc.fileName}</div>
                                        <div className="doc-meta">
                                            {doc.documentType} • {formatFileSize(doc.fileSize || 0)} • Uploaded {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                    {doc.fileUrl && (
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                            ⬇️ Download
                                        </a>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Document Checklist */}
                        {caseData.category?.documentChecklist && (
                            <div style={{ marginTop: 24 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>
                                    📋 Recommended Documents for {caseData.category.name}
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {JSON.parse(caseData.category.documentChecklist).map((doc, i) => (
                                        <span key={i} className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '6px 12px' }}>
                                            {doc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Lawyers Tab */}
                {activeTab === 'lawyers' && (
                    <div className="card">
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h3>⚖️ Assigned Lawyers</h3>
                            {user.role === 'CITIZEN' && (
                                <Link href={`/lawyers?state=${caseData.stateOfIncident}&category=${caseData.category?.name || ''}`}
                                    className="btn btn-sm btn-primary">+ Find Lawyer</Link>
                            )}
                        </div>
                        {caseData.assignments?.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">⚖️</div>
                                <h3>No lawyers assigned</h3>
                                <p>Find a lawyer to get professional legal assistance.</p>
                            </div>
                        ) : (
                            <div className="grid grid-2">
                                {caseData.assignments?.map((a, i) => (
                                    <div key={i} className="lawyer-card">
                                        <div className="flex-between" style={{ marginBottom: 8 }}>
                                            <span className={`badge ${a.status === 'ACCEPTED' ? 'badge-accepted' : a.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'}`}>
                                                {a.status}
                                            </span>
                                            <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{a.roleType}</span>
                                        </div>
                                        <div className="lawyer-name">{a.lawyer?.user?.name || 'Lawyer'}</div>
                                        <div className="lawyer-info">📍 {a.lawyer?.state}{a.lawyer?.city ? `, ${a.lawyer.city}` : ''}</div>
                                        <div className="lawyer-info">🏛️ {a.lawyer?.yearsExperience || 0} years experience</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="card">
                        <h3 style={{ marginBottom: 20 }}>📋 Case Details</h3>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Description</label>
                                <p style={{ marginTop: 4, lineHeight: 1.8 }}>{caseData.description}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Category</label>
                                    <p style={{ marginTop: 4 }}>{caseData.category?.icon} {caseData.category?.name}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</label>
                                    <p style={{ marginTop: 4 }}><span className={`badge ${getStatusBadge(caseData.status)}`}>{caseData.status}</span></p>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Location</label>
                                    <p style={{ marginTop: 4 }}>📍 {caseData.stateOfIncident}{caseData.city ? `, ${caseData.city}` : ''}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Created</label>
                                    <p style={{ marginTop: 4 }}>{new Date(caseData.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {caseData.aiSummary && (
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>🤖 AI Summary</label>
                                    <p style={{ marginTop: 4, lineHeight: 1.8, color: 'var(--text-muted)' }}>{caseData.aiSummary}</p>
                                </div>
                            )}

                            {/* Procedural Steps */}
                            {caseData.category?.proceduralSteps && (
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>📋 Procedural Steps for {caseData.category.name}</label>
                                    <div style={{ marginTop: 12 }}>
                                        {JSON.parse(caseData.category.proceduralSteps).map((step, i) => (
                                            <div key={i} style={{
                                                padding: '12px 16px', marginBottom: 8,
                                                background: 'var(--bg)', borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                borderLeft: `3px solid ${step.urgency === 'CRITICAL' ? '#ef4444' : step.urgency === 'HIGH' ? '#f59e0b' : step.urgency === 'MEDIUM' ? '#3b82f6' : '#64748b'}`
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ fontSize: 14 }}>Step {step.step}: {step.title}</strong>
                                                    <span className={`badge ${step.urgency === 'CRITICAL' ? 'badge-urgent' : step.urgency === 'HIGH' ? 'badge-in-progress' : 'badge-open'}`}>
                                                        {step.urgency} • {step.timeLimit}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{step.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="disclaimer" style={{ marginTop: 24 }}>
                    <strong>⚠️ Disclaimer:</strong> All AI-generated guidance is procedural information only.
                    It does not constitute legal advice or legal representation.
                </div>
            </div>
        </>
    );
}

export default function CaseDetailPage() {
    return <CaseDetail />;
}
