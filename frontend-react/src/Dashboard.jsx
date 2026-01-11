import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Users, ShieldCheck, Shield, UserPlus, X, Bell, Check, XCircle } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';

function Dashboard({ user }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]); // NEW: Pending Invites Helper

    // Create Project Form
    const [newProjName, setNewProjName] = useState('');
    const [newProjRepo, setNewProjRepo] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjTech, setNewProjTech] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Create Project - Members Logic
    const [projectMembers, setProjectMembers] = useState([]); // Array of emails
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Join Form
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        if (user) {
            loadProjects();
            loadInvitations();
        }
    }, [user]);

    //API CALLS 
    const loadProjects = async () => {
        try {
            // Updated to fetch only active projects for this user
            const res = await fetch(`http://localhost:3000/api/projects?userId=${user.id}`);
            setProjects(await res.json());
        } catch (e) { console.error(e); }
    };

    const loadInvitations = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/projects/invitations?userId=${user.id}`);
            if (res.ok) setInvitations(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAcceptInvite = async (projectId) => {
        try {
            await fetch(`http://localhost:3000/api/projects/${projectId}/accept-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            loadProjects();
            loadInvitations();
            // Navbar shares state via polling, but this updates UI immediately
        } catch (e) { console.error(e); }
    };

    const handleDeclineInvite = async (projectId) => {
        try {
            await fetch(`http://localhost:3000/api/projects/${projectId}/decline-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            loadInvitations();
        } catch (e) { console.error(e); }
    };

    //ACȚIUNI DASHBOARD
    const handleCreateProject = async () => {
        if (!newProjName) return alert("Project name required!");
        await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newProjName,
                repository: newProjRepo,
                owner_id: user.id,
                description: newProjDesc,
                technologies: newProjTech,
                members: projectMembers // Send invited members
            })
        });
        setNewProjName(''); setNewProjRepo(''); setNewProjDesc(''); setNewProjTech(''); setProjectMembers([]);
        setIsCreating(false);
        loadProjects();
    };

    const handleAddMemberToProject = (email) => {
        if (!projectMembers.includes(email)) {
            setProjectMembers([...projectMembers, email]);
        }
        setShowInviteModal(false);
    };

    const removeMember = (email) => {
        setProjectMembers(projectMembers.filter(m => m !== email));
    };

    const handleJoinCode = async () => {
        const res = await fetch('http://localhost:3000/api/projects/join-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, code: joinCode })
        });
        if (res.ok) {
            alert("Success!");
            setJoinCode('');
            loadProjects();
        } else {
            alert("Invalid Code!");
        }
    };

    const handleQuickContribute = async (project, e) => {
        e.stopPropagation();
        await fetch(`http://localhost:3000/api/projects/${project.id}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });

        const updated = await (await fetch('http://localhost:3000/api/projects')).json();
        setProjects(updated);

        // Navigate to project immediately
        navigate(`/project/${project.id}`);
    };

    // FILTRARE
    const searchResults = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const managedProjects = searchResults.filter(p =>
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'MP')
    );

    const contributionProjects = searchResults.filter(p =>
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'TST')
    );

    const feedProjects = searchResults.filter(p =>
        !p.ProjectMembers.some(m => m.user_id === user.id)
    );

    return (
        <div>
            {/* Actions Area */}
            <div className="dashboard-actions action-bar" style={{ marginBottom: '2rem' }}>
                {!isCreating ? (
                    <div className="action-buttons-container">
                        <button onClick={() => setIsCreating(true)} className="btn btn-primary">
                            <Plus size={18} /> New Project
                        </button>
                        <div className="join-code-container" style={{ marginBottom: '10px' }}>
                            <Shield size={16} color="var(--text-muted)" />
                            <input
                                placeholder="Join with code..."
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="join-input"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            />
                            {joinCode && <button onClick={handleJoinCode} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px' }}>Join</button>}
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Create New Project</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input className="input-field" placeholder="Project Name" value={newProjName} onChange={e => setNewProjName(e.target.value)} />
                            <input className="input-field" placeholder="Description" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} />
                            <input className="input-field" placeholder="Technologies (React, Node...)" value={newProjTech} onChange={e => setNewProjTech(e.target.value)} />
                            <input className="input-field" placeholder="Repository URL" value={newProjRepo} onChange={e => setNewProjRepo(e.target.value)} />

                            {/* MEMBERS SECTION IN CREATE FORM */}
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Membri Echipă ({projectMembers.length})</label>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <UserPlus size={14} /> Adaugă
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {projectMembers.map(email => (
                                        <div key={email} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '20px', padding: '4px 10px', fontSize: '0.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {email}
                                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeMember(email)} />
                                        </div>
                                    ))}
                                    {projectMembers.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Niciun membru adăugat.</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={handleCreateProject} className="btn btn-primary">Create</button>
                                <button onClick={() => setIsCreating(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTIONS */}

            {/* 0. PENDING INVITATIONS (High Visibility) */}
            {invitations.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                        <Bell size={24} /> Invitații în Așteptare ({invitations.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
                        {invitations.map(inv => (
                            <div key={inv.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent)' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{inv.name}</h3>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Invitat de: <span style={{ color: 'white' }}>{inv.ownerName}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
                                        {inv.description || "Fără descriere"}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                    <button className="btn btn-primary" onClick={() => handleAcceptInvite(inv.id)}>
                                        <Check size={16} /> Acceptă
                                    </button>
                                    <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeclineInvite(inv.id)}>
                                        <XCircle size={16} /> Refuză
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 1. PROIECTE CREATE DE MINE (MANAGER) */}
            {managedProjects.length > 0 && (
                <>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck color="var(--primary)" /> Proiectele Mele</h2>
                    <div className="dashboard-grid">
                        {managedProjects.map(p => (
                            <div key={p.id} className="glass-panel project-card" onClick={() => navigate(`/project/${p.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ margin: 0 }}>{p.name}</h3>
                                    <span className="tag mp">Manager</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.description || "Fără descriere"}</p>
                                <div className="card-meta">
                                    <span>{p.technologies?.split(',')[0] || "Code"}</span>
                                    <span>{p.ProjectMembers.length} membri</span>
                                    <span style={{ color: '#ef4444' }}> • {p.Bugs ? p.Bugs.length : 0} bug-uri</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* 2. PROIECTE UNDE SUNT TESTER */}
            {contributionProjects.length > 0 && (
                <>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2rem' }}><Users color="var(--success)" /> Contribui</h2>
                    <div className="dashboard-grid">
                        {contributionProjects.map(p => (
                            <div key={p.id} className="glass-panel project-card" onClick={() => navigate(`/project/${p.id}`)} style={{ cursor: 'pointer', borderLeft: '3px solid var(--success)' }}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ margin: 0 }}>{p.name}</h3>
                                    <span className="tag tst">Tester</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.description || "Fără descriere"}</p>
                                <div className="card-meta">
                                    <span style={{ color: '#ef4444' }}>🪲 {p.Bugs ? p.Bugs.length : 0} probleme</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* 3. LISTA PUBLICĂ (EXPLOREAZĂ) */}
            {feedProjects.length > 0 && (
                <>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2rem' }}>🌍 Explorează</h2>
                    <div className="dashboard-grid">
                        {feedProjects.map(p => (
                            <div key={p.id} className="glass-panel project-card">
                                <h3>{p.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.description || "Alătură-te echipei!"}</p>
                                <div style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                                    🐞 {p.Bugs ? p.Bugs.length : 0} probleme active
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', marginTop: '10px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                    onClick={(e) => handleQuickContribute(p, e)}
                                >
                                    Devino Tester
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {projects.length === 0 && <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>Nu am găsit proiecte.</p>}

            {showInviteModal && (
                <InviteMemberModal
                    onClose={() => setShowInviteModal(false)}
                    onInvite={handleAddMemberToProject}
                    isLoading={false}
                />
            )}
        </div>
    );
}

export default Dashboard;