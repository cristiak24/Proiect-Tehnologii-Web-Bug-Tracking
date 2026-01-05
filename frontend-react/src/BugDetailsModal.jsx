import { useState } from 'react';
import { X, Bug, User, MessageSquare, ExternalLink, Calendar, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import CommentsSection from './components/CommentsSection';

function BugDetailsModal({ bug, user, userRole, onClose, onUpdateStatus, onAssign, project }) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(true);

    if (!bug) return null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('ro-RO', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'Critical': return <Flame size={16} />;
            case 'Medium': return <AlertTriangle size={16} />;
            default: return <Bug size={16} />;
        }
    };

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel" style={{
                width: '90%',
                maxWidth: '800px',
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                }}>
                    <div style={{ flex: 1, paddingRight: '40px' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <span style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: bug.severity === 'Critical' ? '#ef4444' : (bug.severity === 'Medium' ? '#f97316' : '#eab308'),
                                    boxShadow: `0 0 8px ${bug.severity === 'Critical' ? 'rgba(239, 68, 68, 0.5)' : (bug.severity === 'Medium' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(234, 179, 8, 0.5)')}`
                                }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#e2e8f0' }}>{bug.severity}</span>
                            </span>
                            <span className={`prio-badge ${bug.priority}`} style={{ fontSize: '0.8rem', padding: '2px 8px' }}>
                                Prioritate: {bug.priority}
                            </span>
                            <span className={`tag ${bug.status === 'Resolved' ? 'mp' : (bug.status === 'Closed' ? 'tst' : 'progress')}`} style={{ background: bug.status === 'Open' ? 'var(--danger)' : '' }}>
                                {bug.status}
                            </span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', lineHeight: '1.3' }}>{bug.title || "Bug Details"}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={28} />
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Main Content */}
                    <div style={{ flex: 2, padding: '25px', overflowY: 'auto', borderRight: '1px solid var(--glass-border)' }}>
                        {/* Reporter & Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} />
                                Raportat de <b style={{ color: 'white' }}>{bug.Reporter?.name || 'Unknown'}</b>
                            </div>
                            <span>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} />
                                {formatDate(bug.createdAt)}
                            </div>
                        </div>

                        {/* Full Description */}
                        <div style={{ marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ marginTop: 0, color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={16} /> Descriere Detaliată & Context
                            </h4>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                {bug.description}
                            </div>

                            {/* Attached Image */}
                            {bug.image_path && (
                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Imagine Atașată</label>
                                    <a href={`http://localhost:3000${bug.image_path}`} target="_blank" rel="noreferrer">
                                        <img
                                            src={`http://localhost:3000${bug.image_path}`}
                                            alt="Bug Attachment"
                                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                                        />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Actions Area */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#94a3b8' }}>Acțiuni Rapide</h4>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {/* MP ACTIONS */}
                                {userRole === 'MP' && ['Open', 'In Progress'].includes(bug.status) && (
                                    <>
                                        {!bug.assigned_to && (
                                            <button
                                                onClick={() => onAssign(bug.id, user.id)}
                                                className="btn"
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                            >
                                                🙋‍♂️ Preia Bug-ul
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onUpdateStatus(bug.id, 'Resolved')}
                                            className="btn btn-primary"
                                        >
                                            ✅ Marchează Rezolvat
                                        </button>
                                    </>
                                )}

                                {/* TESTER ACTIONS */}
                                {bug.status === 'Resolved' && (
                                    <>
                                        <button
                                            onClick={() => onUpdateStatus(bug.id, 'Closed')}
                                            className="btn btn-primary"
                                            style={{ background: 'var(--success)' }}
                                        >
                                            🎉 Confirmă (Close)
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(bug.id, 'Open')}
                                            className="btn btn-danger"
                                        >
                                            ❌ Redeschide
                                        </button>
                                    </>
                                )}

                                {bug.status === 'Closed' && (
                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={18} /> Acest bug este închis.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <CommentsSection bugId={bug.id} user={user} />
                    </div>

                    {/* Sidebar Details */}
                    <div style={{ flex: 1, padding: '25px', background: 'rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                        <h4 style={{ marginTop: 0, color: '#94a3b8', marginBottom: '20px' }}>Detalii Tehnice</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Alocat către</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: bug.assigned_to ? 'var(--primary)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        {bug.assigned_to ? <User size={16} /> : <User size={16} style={{ opacity: 0.5 }} />}
                                    </div>
                                    <div>
                                        {bug.assigned_to ? (
                                            <span style={{ fontWeight: 'bold' }}>
                                                {project?.ProjectMembers?.find(m => m.user_id === bug.assigned_to)?.User.name || 'Unknown User'}
                                            </span>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Nealocat</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {bug.fix_link && bug.fix_link !== 'null' && (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Link Rezolvare</label>
                                    <a
                                        href={bug.fix_link.startsWith('http') ? bug.fix_link : `https://${bug.fix_link}`}
                                        target="_blank"
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', textDecoration: 'none', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px' }}
                                    >
                                        <ExternalLink size={16} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Open Commit/PR</span>
                                    </a>
                                </div>
                            )}

                            {bug.commit_link && bug.commit_link !== 'null' && bug.commit_link !== 'Fără link' && (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Link Raportare</label>
                                    <a
                                        href={bug.commit_link.startsWith('http') ? bug.commit_link : `https://${bug.commit_link}`}
                                        target="_blank"
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px' }}
                                    >
                                        <ExternalLink size={16} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Open Screenshot/Link</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BugDetailsModal;
