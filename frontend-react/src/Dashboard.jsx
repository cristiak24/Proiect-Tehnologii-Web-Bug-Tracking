import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Users, ShieldCheck, Shield } from 'lucide-react';

function Dashboard({ user }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    // --- STATE ---
    const [projects, setProjects] = useState([]);

    // Create Project Form
    const [newProjName, setNewProjName] = useState('');
    const [newProjRepo, setNewProjRepo] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjTech, setNewProjTech] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Join Form
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => { loadProjects(); }, []);

    //API CALLS 
    const loadProjects = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/projects');
            setProjects(await res.json());
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
                technologies: newProjTech
            })
        });
        setNewProjName(''); setNewProjRepo(''); setNewProjDesc(''); setNewProjTech('');
        setIsCreating(false);
        loadProjects();
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
            <div className="dashboard-actions" style={{ marginBottom: '2rem' }}>
                {!isCreating ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setIsCreating(true)} className="btn btn-primary">
                            <Plus size={18} /> New Project
                        </button>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--glass-bg)', padding: '5px 15px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <Shield size={16} color="var(--text-muted)" />
                            <input
                                placeholder="Join with code..."
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                            />
                            {joinCode && <button onClick={handleJoinCode} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Join</button>}
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '20px', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Create New Project</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input className="input-field" placeholder="Project Name" value={newProjName} onChange={e => setNewProjName(e.target.value)} />
                            <input className="input-field" placeholder="Description" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} />
                            <input className="input-field" placeholder="Technologies (React, Node...)" value={newProjTech} onChange={e => setNewProjTech(e.target.value)} />
                            <input className="input-field" placeholder="Repository URL" value={newProjRepo} onChange={e => setNewProjRepo(e.target.value)} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={handleCreateProject} className="btn btn-primary">Create</button>
                                <button onClick={() => setIsCreating(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTIONS */}

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
        </div>
    );
}

export default Dashboard;