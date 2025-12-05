import { useState, useEffect } from 'react';
import AddBugModal from './AddBugModal';

function Dashboard({ user, searchQuery }) {
    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [view, setView] = useState('list'); // 'list' sau 'garden'
    const [activeProject, setActiveProject] = useState(null);
    const [bugs, setBugs] = useState([]);
    
    // Formulare Dashboard
    const [newProjName, setNewProjName] = useState('');
    const [newProjRepo, setNewProjRepo] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjTech, setNewProjTech] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // State Grădină
    const [activeTab, setActiveTab] = useState('active');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { loadProjects(); }, []);

    // --- API CALLS ---
    const loadProjects = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/projects');
            setProjects(await res.json());
        } catch (e) { console.error(e); }
    };

    const loadBugs = async (projId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projId}/bugs`);
            setBugs(await res.json());
        } catch (e) { console.error(e); }
    };

    // --- ACȚIUNI DASHBOARD ---
    const handleCreateProject = async () => {
        if (!newProjName) return alert("Pune un nume la proiect!");
        await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                name: newProjName, 
                repository: newProjRepo, 
                owner_id: user.id,
                description: newProjDesc,
                technologies: newProjTech
            })
        });
        setNewProjName(''); setNewProjRepo(''); setNewProjDesc(''); setNewProjTech('');
        loadProjects();
    };

    const handleJoinCode = async () => {
        const res = await fetch('http://localhost:3000/api/projects/join-code', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id, code: joinCode })
        });
        if(res.ok) {
            alert("Succes!");
            setJoinCode('');
            loadProjects();
        } else {
            alert("Cod invalid!");
        }
    };

    // Logica pentru "Tester Universal"
    const handleQuickContribute = async (project) => {
        // 1. Join automat ca TST
        await fetch(`http://localhost:3000/api/projects/${project.id}/join`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id })
        });
        
        // 2. Refresh lista de proiecte
        const res = await fetch('http://localhost:3000/api/projects');
        const updatedProjects = await res.json();
        setProjects(updatedProjects);

        // 3. Găsim proiectul actualizat și deschidem grădina
        const updatedProject = updatedProjects.find(p => p.id === project.id);
        handleOpenGarden(updatedProject);
    };

    const handleOpenGarden = async (project) => {
        setActiveProject(project);
        await loadBugs(project.id);
        setView('garden'); 
    };

    // --- ACȚIUNI GRĂDINĂ (BUG-URI) ---
    const handleCreateBug = async (bugData) => {
        await fetch('http://localhost:3000/api/bugs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ...bugData, project_id: activeProject.id, reporter_id: user.id })
        });
        setShowModal(false);
        loadBugs(activeProject.id); 
    };

    const handleStatus = async (bugId, newStatus) => {
        await fetch(`http://localhost:3000/api/bugs/${bugId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: newStatus })
        });
        loadBugs(activeProject.id);
    };

    // --- HELPERE VIZUALE ---
    const calculateHealth = (projectBugs) => {
        if (!projectBugs || projectBugs.length === 0) return 100;
        const closed = projectBugs.filter(b => b.status === 'Closed').length;
        return Math.round((closed / projectBugs.length) * 100);
    };

    // --- FILTRARE ---
    const searchResults = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 1. Proiecte unde sunt MP (Manager)
    const managedProjects = searchResults.filter(p => 
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'MP')
    );

    // 2. Proiecte unde sunt TST (Tester/Contribuitor)
    const contributionProjects = searchResults.filter(p => 
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'TST')
    );

    // 3. Proiecte Publice (Niciun rol)
    const feedProjects = searchResults.filter(p => 
        !p.ProjectMembers.some(m => m.user_id === user.id)
    );

    // ===================================
    // VEDEREA 1: LISTĂ (DASHBOARD)
    // ===================================
    if (view === 'list') {
        return (
            <div>
                {/* ZONA ACȚIUNI (Ascunsă la search pentru claritate) */}
                {!searchQuery && (
                    <div className="actions-grid">
                        <div className="action-card create-card">
                            <h3>🚀 Proiect Nou</h3>
                            <input placeholder="Nume Proiect" value={newProjName} onChange={e => setNewProjName(e.target.value)} />
                            <input placeholder="Descriere scurtă" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} />
                            <input placeholder="Tehnologii (ex: React, Node)" value={newProjTech} onChange={e => setNewProjTech(e.target.value)} />
                            <input placeholder="Link GitHub" value={newProjRepo} onChange={e => setNewProjRepo(e.target.value)} />
                            <button onClick={handleCreateProject} className="btn-primary">Creează</button>
                        </div>
                        <div className="action-card join-card">
                            <h3>🔑 Join MP</h3>
                            <p>Ai un cod de la echipă?</p>
                            <input placeholder="Cod (ex: A7X92B)" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                            <button onClick={handleJoinCode} className="btn-secondary">Alătură-te</button>
                        </div>
                    </div>
                )}

                <hr className="divider" />

                {/* SECȚIUNEA 1: PROIECTELE TALE (MP) - CARDURI COMPLEXE */}
                <h2 style={{color: '#0f172a'}}>📂 Proiectele Tale (MP)</h2>
                <div className="projects-grid">
                    {managedProjects.length === 0 && <p style={{color:'#64748b'}}>Nu gestionezi niciun proiect.</p>}
                    
                    {managedProjects.map(p => {
                        const health = calculateHealth(p.Bugs); // Backend-ul trebuie să trimită Bugs
                        const techTags = p.technologies ? p.technologies.split(',') : [];

                        return (
                            <div key={p.id} className="project-card rich-card" onClick={() => handleOpenGarden(p)}>
                                {/* Header */}
                                <div className="card-header">
                                    <h4>{p.name}</h4>
                                    <span className="badge-mp">MP</span>
                                </div>
                                
                                {/* Descriere */}
                                <p className="proj-desc">{p.description || "Fără descriere."}</p>

                                {/* Tag-uri */}
                                <div className="tech-tags">
                                    {techTags.map((tag, i) => (
                                        <span key={i} className="tech-tag">{tag.trim()}</span>
                                    ))}
                                </div>

                                {/* Bara Sănătate */}
                                <div className="health-section">
                                    <div className="health-label">
                                        <span>Sănătate</span>
                                        <span>{health}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: `${health}%`, background: health > 50 ? '#22c55e' : '#e11d48'}}></div>
                                    </div>
                                </div>

                                {/* Avatare Echipă */}
                                <div className="team-avatars">
                                    {p.ProjectMembers.slice(0, 4).map(m => (
                                        <div key={m.id} className="avatar-circle" title={m.User?.email}>
                                            {m.User?.email ? m.User.email[0].toUpperCase() : '?'}
                                        </div>
                                    ))}
                                    {p.ProjectMembers.length > 4 && <div className="avatar-circle more">+{p.ProjectMembers.length - 4}</div>}
                                </div>

                                <div className="code-box">Cod: {p.join_code}</div>
                                <button className="btn-open">Administrează 🛠️</button>
                            </div>
                        );
                    })}
                </div>

                {/* SECȚIUNEA 2: CONTRIBUȚII (TST) */}
                <h2 style={{color: '#0f172a', marginTop: '40px'}}>🏆 Contribuțiile Tale (Tester)</h2>
                <div className="projects-grid">
                    {contributionProjects.length === 0 && <p style={{color:'#64748b'}}>Nu ești tester nicăieri.</p>}
                    
                    {contributionProjects.map(p => (
                        <div key={p.id} className="project-card" style={{borderLeft: '5px solid #f59e0b'}} onClick={() => handleOpenGarden(p)}>
                            <div className="card-header">
                                <h4>{p.name}</h4>
                                <span className="badge-tst">Tester</span>
                            </div>
                            <small>{p.repository}</small>
                            <button className="btn-open" style={{background:'#f59e0b'}}>Raportează Bug 🐞</button>
                        </div>
                    ))}
                </div>

                {/* SECȚIUNEA 3: FEED PUBLIC */}
                <h2 style={{color: '#0f172a', marginTop: '40px'}}>🌍 Găsește Proiecte Noi</h2>
                <div className="projects-grid">
                    {feedProjects.length === 0 && <p style={{color:'#64748b'}}>Niciun proiect public nou.</p>}
                    
                    {feedProjects.map(p => (
                        <div key={p.id} className="project-card feed-project">
                            <div className="card-header">
                                <h4>{p.name}</h4>
                            </div>
                            <p style={{fontSize:'0.9rem', color:'#666'}}>{p.description || "Alătură-te echipei!"}</p>
                            
                            <button 
                                className="btn-outline" 
                                style={{borderColor: '#e11d48', color: '#e11d48', fontWeight: 'bold'}}
                                onClick={() => handleQuickContribute(p)}
                            >
                                🐞 Vreau să ajut!
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ===================================
    // VEDEREA 2: GRĂDINĂ (BUG-URI)
    // ===================================
    
    const filteredBugs = bugs.filter(b => {
        if(activeTab === 'active') return b.status === 'Open' || b.status === 'In Progress';
        if(activeTab === 'resolved') return b.status === 'Resolved';
        if(activeTab === 'closed') return b.status === 'Closed';
        return true;
    });

    const currentRole = activeProject?.ProjectMembers?.find(m => m.user_id === user.id)?.role;

    return (
        <div>
            <button onClick={() => setView('list')} style={{background:'none', border:'none', color:'#64748b', cursor:'pointer', marginBottom:'15px', fontSize:'1rem'}}>⬅ Înapoi la Dashboard</button>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h1 style={{color: '#0f172a', margin:0}}>{activeProject?.name} 🌿</h1>
                <span style={{background:'#e2e8f0', padding:'5px 10px', borderRadius:'20px', fontSize:'0.8rem'}}>
                    Rol: <b>{currentRole}</b>
                </span>
            </div>

            <div className="garden-tabs" style={{marginTop:'30px'}}>
                <button className={`tab-btn tab-active ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>🔴 Active</button>
                <button className={`tab-btn tab-resolved ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>🟢 De Verificat</button>
                <button className={`tab-btn tab-closed ${activeTab === 'closed' ? 'active' : ''}`} onClick={() => setActiveTab('closed')}>⚪ Istoric</button>
            </div>

            <div className="bug-cards-container">
                {filteredBugs.length === 0 && <p style={{textAlign:'center', width:'100%', color:'#94a3b8'}}>Nicio buburuză aici... totul e curat! ✨</p>}
                
                {filteredBugs.map(b => (
                    <div key={b.id} className={`bug-card severity-${b.severity}`}>
                        <div className="bug-header">
                            <span style={{fontWeight:'bold'}}>{b.description.substring(0, 40)}...</span>
                            <span title={b.severity}>{b.severity === 'Critical' ? '🔥' : (b.severity === 'Medium' ? '🐞' : '🎨')}</span>
                        </div>
                        <p style={{fontSize:'0.9rem', color:'#666', margin:'10px 0'}}>{b.description}</p>
                        
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#94a3b8'}}>
                            <span>Prioritate: {b.priority}</span>
                            {b.commit_link !== 'Fără link' && <a href={b.commit_link} target="_blank" style={{color:'#3b82f6'}}>Link 🔗</a>}
                        </div>

                        {/* BUTOANE ACȚIUNI MP (Doar pe Active) */}
                        {activeTab === 'active' && currentRole === 'MP' && (
                            <button className="btn-open" style={{marginTop:'15px', background:'#3b82f6'}} onClick={() => handleStatus(b.id, 'Resolved')}>🛠️ Am reparat!</button>
                        )}
                        
                        {/* BUTOANE ACȚIUNI TESTER (Doar pe Resolved) */}
                        {activeTab === 'resolved' && (
                            <div className="status-actions">
                                <button className="btn-confirm" onClick={() => handleStatus(b.id, 'Closed')}>✅ Confirmă</button>
                                <button className="btn-reject" onClick={() => handleStatus(b.id, 'Open')}>❌ Refuză</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Butonul de adăugare apare pentru oricine e membru (și MP și TST pot raporta bug-uri) */}
            <button className="fab-btn" onClick={() => setShowModal(true)} title="Adaugă Bug">＋</button>
            
            {showModal && <AddBugModal onClose={() => setShowModal(false)} onSubmit={handleCreateBug} />}
        </div>
    );
}

export default Dashboard;