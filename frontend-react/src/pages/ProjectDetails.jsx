import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, Star, GitFork, ArrowLeft, Bug, CheckCircle, Clock, ChevronDown, ChevronUp, MessageSquare, Users, UserPlus, Maximize2 } from 'lucide-react';
import AddBugModal from '../AddBugModal';
import CommentsSection from '../components/CommentsSection';
import BugDetailsModal from '../BugDetailsModal';

function ProjectDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [repoInfo, setRepoInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // active, resolved, closed
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedBug, setExpandedBug] = useState(null); // ID-ul bug-ului deschis pentru comentarii
    const [showTeam, setShowTeam] = useState(false); // Toggle Team View
    const [selectedBug, setSelectedBug] = useState(null); // Bug-ul selectat pentru modal

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3000/api/projects/${id}`);
            if (!res.ok) throw new Error("Proiect inexistent");
            const data = await res.json();
            setProject(data);

            if (data.repository && data.repository.includes('github.com')) {
                const parts = data.repository.split('github.com/')[1].split('/');
                if (parts.length >= 2) {
                    fetchRepoInfo(parts[0], parts[1]);
                }
            }
        } catch (e) {
            console.error(e);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchRepoInfo = async (owner, repo) => {
        try {
            const res = await fetch(`http://localhost:3000/api/github/repo-info?owner=${owner}&repo=${repo}`);
            if (res.ok) setRepoInfo(await res.json());
        } catch (e) { console.error("GitHub fetch failed", e); }
    };

    const handleCreateBug = async (bugData) => {
        await fetch('http://localhost:3000/api/bugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bugData, project_id: id, reporter_id: user.id })
        });
        setShowModal(false);
        loadData();
    };

    const handleStatus = async (bugId, newStatus) => {
        let fixLink = null;
        if (newStatus === 'Resolved') {
            fixLink = prompt("Introduce link-ul către commit/PR rezolvare (opțional):");
            if (fixLink === null) return; // User pressed Cancel
        }

        await fetch(`http://localhost:3000/api/bugs/${bugId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, fix_link: fixLink })
        });

        // Dacă suntem în modal, actualizăm și bug-ul selectat local pt UI instant
        if (selectedBug && selectedBug.id === bugId) {
            setSelectedBug(prev => ({ ...prev, status: newStatus, fix_link: fixLink }));
        }

        loadData();
    };

    const handleAssign = async (bugId, userId) => {
        await fetch(`http://localhost:3000/api/bugs/${bugId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assigned_to: userId })
        });

        if (selectedBug && selectedBug.id === bugId) {
            setSelectedBug(prev => ({ ...prev, assigned_to: userId }));
        }

        loadData();
    };

    const toggleComments = (bugId) => {
        if (expandedBug === bugId) setExpandedBug(null);
        else setExpandedBug(bugId);
    };

    if (loading) return <div style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>Se încarcă...</div>;
    if (!project) return null;

    const currentMember = project.ProjectMembers.find(m => m.user_id === user.id);
    const userRole = currentMember?.role;
    const bugs = project.Bugs || [];
    const filteredBugs = bugs.filter(b => {
        if (activeTab === 'active') return ['Open', 'In Progress'].includes(b.status);
        if (activeTab === 'resolved') return b.status === 'Resolved';
        if (activeTab === 'closed') return b.status === 'Closed';
        return true;
    });

    // Filtrare Membri
    const managers = project.ProjectMembers.filter(m => m.role === 'MP');
    const testers = project.ProjectMembers.filter(m => m.role === 'TST');

    return (
        <div className="project-details">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginBottom: '10px', padding: '5px 10px', fontSize: '0.8rem' }}>
                    <ArrowLeft size={14} /> Back
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {project.name}
                            {repoInfo && <a href={project.repository.startsWith('http') ? project.repository : `https://${project.repository}`} target="_blank" style={{ color: 'var(--text-muted)' }}><Github size={20} /></a>}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>{project.description}</p>

                        {repoInfo && (
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24' }}><Star size={14} /> {repoInfo.stargazers_count} Stars</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}><GitFork size={14} /> {repoInfo.forks_count} Forks</span>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => setShowTeam(!showTeam)}
                            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                        >
                            <Users size={16} /> {showTeam ? 'Ascunde Echipa' : 'Vezi Echipa'}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className={`tag ${userRole === 'MP' ? 'mp' : 'tst'}`} style={{ fontSize: '1rem', padding: '5px 15px' }}>
                                {userRole === 'MP' ? 'Manager' : 'Tester'}
                            </span>
                            <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Cod: <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px' }}>{project.join_code}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEAM SECTION (NEW) */}
            {showTeam && (
                <div className="glass-panel fade-in" style={{ marginBottom: '20px', padding: '20px' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={20} /> Echipa Proiectului</h3>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <h4 style={{ color: '#93c5fd', marginBottom: '10px' }}>Manageri ({managers.length})</h4>
                            {managers.map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {m.User.name[0]}
                                    </div>
                                    <span>{m.User.name}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 style={{ color: '#6ee7b7', marginBottom: '10px' }}>Testeri ({testers.length})</h4>
                            {testers.length === 0 ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Niciun tester încă.</span> :
                                testers.map(m => (
                                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'black' }}>
                                            {m.User.name[0]}
                                        </div>
                                        <span>{m.User.name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bugs Section */}
            <div className="glass-panel" style={{ minHeight: '60vh' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                        style={{ flex: 1, padding: '15px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none', color: activeTab === 'active' ? 'white' : 'var(--text-muted)' }}
                    >
                        Active ({bugs.filter(b => ['Open', 'In Progress'].includes(b.status)).length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resolved')}
                        style={{ flex: 1, padding: '15px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'resolved' ? '2px solid var(--success)' : 'none', color: activeTab === 'resolved' ? 'white' : 'var(--text-muted)' }}
                    >
                        Resolved ({bugs.filter(b => b.status === 'Resolved').length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('closed')}
                        style={{ flex: 1, padding: '15px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'closed' ? '2px solid var(--secondary)' : 'none', color: activeTab === 'closed' ? 'white' : 'var(--text-muted)' }}
                    >
                        History
                    </button>
                </div>

                {/* Bug List */}
                <div style={{ padding: '20px' }}>
                    {filteredBugs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                            <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                            <p>Totul e curat! 🎉</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredBugs.map(b => (
                                <div key={b.id} className="bug-item-container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    <div className="bug-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div
                                                className={`severity-indicator`}
                                                title={`Gravitate: ${b.severity}`}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    background: b.severity === 'Critical' ? '#ef4444' : (b.severity === 'Medium' ? '#f97316' : '#eab308'),
                                                    boxShadow: `0 0 10px ${b.severity === 'Critical' ? 'rgba(239, 68, 68, 0.5)' : (b.severity === 'Medium' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(234, 179, 8, 0.5)')}`,
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{b.title || b.description}</div>
                                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                                    <span className={`prio-badge ${b.priority}`}>{`Prioritate: ${b.priority}`}</span>
                                                    <span>•</span>
                                                    <span>Creat de: {b.Reporter?.name || `ID#${b.reporter_id}`}</span>

                                                    {/* ASSIGNMENT INFO */}
                                                    {b.assigned_to ? (
                                                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <UserPlus size={12} /> Alocat lui: {project.ProjectMembers.find(m => m.user_id === b.assigned_to)?.User.name || 'Unknown'}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontStyle: 'italic' }}>Nealocat</span>
                                                    )}

                                                    {b.fix_link && b.fix_link !== 'null' && (
                                                        <a href={b.fix_link.startsWith('http') ? b.fix_link : `https://${b.fix_link}`} target="_blank" style={{ color: 'var(--success)', fontWeight: 'bold', borderBottom: '1px dashed var(--success)' }}>Vezi Rezolvarea</a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                                            {/* Button View Details */}
                                            <button
                                                onClick={() => setSelectedBug(b)}
                                                style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
                                                title="Vezi Detalii"
                                            >
                                                <Maximize2 size={16} /> Detalii
                                            </button>

                                            {/* ASSIGN BUTTON (For MPs) */}
                                            {userRole === 'MP' && activeTab === 'active' && !b.assigned_to && (
                                                <button
                                                    onClick={() => handleAssign(b.id, user.id)}
                                                    style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer', borderRadius: '4px' }}
                                                >
                                                    Preia
                                                </button>
                                            )}

                                            {/* Button Comments */}
                                            <button
                                                onClick={() => toggleComments(b.id)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                title="Discuție"
                                            >
                                                <MessageSquare size={18} />
                                                {expandedBug === b.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>

                                            {/* MP ACTIONS */}
                                            {userRole === 'MP' && activeTab === 'active' && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleStatus(b.id, 'Resolved')}
                                                    style={{ fontSize: '0.8rem', padding: '5px 15px' }}
                                                >
                                                    Rezolvă
                                                </button>
                                            )}

                                            {/* TESTER ACTIONS (On Resolved) */}
                                            {activeTab === 'resolved' && (
                                                <>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ background: 'var(--success)', fontSize: '0.8rem' }}
                                                        onClick={() => handleStatus(b.id, 'Closed')}
                                                    >
                                                        Confirmă
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ fontSize: '0.8rem' }}
                                                        onClick={() => handleStatus(b.id, 'Open')}
                                                    >
                                                        Redeschide
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Comments Section */}
                                    {expandedBug === b.id && (
                                        <div style={{ padding: '0 15px 15px 15px' }}>
                                            <CommentsSection bugId={b.id} user={user} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                className="btn-primary"
                style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    borderRadius: '50%', width: '60px', height: '60px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
                    fontSize: '24px'
                }}
                onClick={() => setShowModal(true)}
            >
                +
            </button>

            {showModal && <AddBugModal onClose={() => setShowModal(false)} onSubmit={handleCreateBug} />}

            {/* Bug Details Modal */}
            {selectedBug && (
                <BugDetailsModal
                    bug={selectedBug}
                    user={user}
                    userRole={userRole}
                    project={project}
                    onClose={() => setSelectedBug(null)}
                    onUpdateStatus={handleStatus}
                    onAssign={handleAssign}
                />
            )}
        </div>
    );
}

export default ProjectDetails;
