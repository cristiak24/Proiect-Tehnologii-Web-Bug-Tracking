import { useState, useEffect } from 'react';
import AddBugModal from './AddBugModal';

function Dashboard({ user, searchQuery }) {
    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [view, setView] = useState('list'); // 'list' sau 'garden'
    const [activeProject, setActiveProject] = useState(null);
    const [bugs, setBugs] = useState([]);
    
    // Formulare
    const [newProjName, setNewProjName] = useState('');
    const [newProjRepo, setNewProjRepo] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // Grădină
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

    // --- LOGICA TESTER UNIVERSAL ---
    const handleQuickContribute = async (project) => {
        // 1. Join automat ca TST
        await fetch(`http://localhost:3000/api/projects/${project.id}/join`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id })
        });
        // 2. Refresh și deschidere
        await loadProjects();
        // Căutăm proiectul actualizat în lista nouă (local trick) pentru a avea rolul corect imediat
        const updatedProject = { ...project, ProjectMembers: [...project.ProjectMembers, { user_id: user.id, role: 'TST' }] };
        handleOpenGarden(updatedProject);
    };

    const handleOpenGarden = async (project) => {
        setActiveProject(project);
        await loadBugs(project.id);
        setView('garden'); 
    };

    // --- ALTE ACȚIUNI ---
    const handleCreateProject = async () => {
        if (!newProjName) return alert("Pune un nume!");
        await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newProjName, repository: newProjRepo, owner_id: user.id })
        });
        setNewProjName(''); setNewProjRepo('');
        loadProjects();
        alert("Proiect creat!");
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

    // --- FILTRARE AVANSATĂ (MP vs TST vs Feed) ---
    
    // 1. Filtrăm după Search
    const searchResults = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. PROIECTE GESTIONATE (Unde sunt MP)
    const managedProjects = searchResults.filter(p => 
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'MP')
    );

    // 3. CONTRIBUȚII (Unde sunt TST)
    const contributionProjects = searchResults.filter(p => 
        p.ProjectMembers.some(m => m.user_id === user.id && m.role === 'TST')
    );

    // 4. FEED PUBLIC (Unde NU sunt membru)
    const feedProjects = searchResults.filter(p => 
        !p.ProjectMembers.some(m => m.user_id === user.id)
    );

    // ===================================
    // VEDEREA 1: LISTĂ
    // ===================================
    if (view === 'list') {
        return (
            <div>
                {/* ZONA ACȚIUNI (Doar când nu căutăm) */}
                {!searchQuery && (
                    <div className="actions-grid">
                        <div className="action-card create-card">
                            <h3>🚀 Proiect Nou</h3>
                            <input placeholder="Nume Proiect" value={newProjName} onChange={e => setNewProjName(e.target.value)} />
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

                {/* 1. PROIECTELE MELE (MP) */}
                <h2 style={{color: '#0f172a'}}>📂 Proiectele Tale (MP)</h2>
                <div className="projects-grid">
                    {managedProjects.length === 0 && <p style={{color:'#64748b'}}>Nu gestionezi niciun proiect.</p>}
                    
                    {managedProjects.map(p => (
                        <div key={p.id} className="project-card" onClick={() => handleOpenGarden(p)}>
                            <div className="card-header">
                                <h4>{p.name}</h4>
                                <span className="badge-mp">MP</span>
                            </div>
                            <small>{p.repository || 'No Repo'}</small>
                            <div className="code-box">Cod: {p.join_code}</div>
                            <button className="btn-open">Administrează 🛠️</button>
                        </div>
                    ))}
                </div>

                {/* 2. CONTRIBUȚIILE MELE (TST) - SECȚIUNE NOUĂ */}
                <h2 style={{color: '#0f172a', marginTop: '40px'}}>🏆 Contribuțiile Tale (Tester)</h2>
                <div className="projects-grid">
                    {contributionProjects.length === 0 && <p style={{color:'#64748b'}}>Încă nu te-ai alăturat ca tester la niciun proiect.</p>}
                    
                    {contributionProjects.map(p => (
                        <div key={p.id} className="project-card" style={{borderLeft: '5px solid #f59e0b'}} onClick={() => handleOpenGarden(p)}>
                            <div className="card-header">
                                <h4>{p.name}</h4>
                                <span className="badge-tst">Tester</span>
                            </div>
                            <small>Ajut la acest proiect</small>
                            <button className="btn-open" style={{background:'#f59e0b'}}>Raportează Bug 🐞</button>
                        </div>
                    ))}
                </div>

                <hr className="divider" />

                {/* 3. FEED PUBLIC */}
                <h2 style={{color: '#0f172a'}}>🌍 Găsește Proiecte Noi (Debugging)</h2>
                <p style={{color: '#64748b', marginBottom: '20px'}}>Alătură-te comunității și ajută la repararea codului.</p>
                
                <div className="projects-grid">
                    {feedProjects.length === 0 && <p>Niciun proiect public disponibil.</p>}
                    
                    {feedProjects.map(p => (
                        <div key={p.id} className="project-card feed-project">
                            <div className="card-header">
                                <h4>{p.name}</h4>
                            </div>
                            <p>Proprietar ID: {p.owner_id}</p>
                            
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
    // VEDEREA 2: GRĂDINĂ
    // ===================================
    const filteredBugs = bugs.filter(b => {
        if(activeTab === 'active') return b.status === 'Open' || b.status === 'In Progress';
        if(activeTab === 'resolved') return b.status === 'Resolved';
        if(activeTab === 'closed') return b.status === 'Closed';
        return true;
    });

    // Verificăm rolul în proiectul activ
    const currentRole = activeProject.ProjectMembers.find(m => m.user_id === user.id)?.role;

    return (
        <div>
            <button onClick={() => setView('list')} style={{background:'none', border:'none', color:'#64748b', cursor:'pointer', marginBottom:'15px'}}>⬅ Înapoi la Dashboard</button>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h1 style={{color: '#0f172a', margin:0}}>{activeProject.name} 🌿</h1>
                <span style={{background:'#e2e8f0', padding:'5px 10px', borderRadius:'20px', fontSize:'0.8rem'}}>
                    Rolul tău: <b>{currentRole}</b>
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
                            <span>{b.description}</span>
                            <span>{b.severity === 'Critical' ? '🔥' : '🐞'}</span>
                        </div>
                        <span className="bug-status-badge">{b.status}</span>
                        
                        {/* BUTOANE ACȚIUNI MP */}
                        {activeTab === 'active' && currentRole === 'MP' && (
                            <button className="btn-open" style={{marginTop:'15px', background:'#3b82f6'}} onClick={() => handleStatus(b.id, 'Resolved')}>🛠️ Am reparat!</button>
                        )}
                        
                        {/* BUTOANE ACȚIUNI TESTER */}
                        {activeTab === 'resolved' && (
                            <div className="status-actions">
                                <button className="btn-confirm" onClick={() => handleStatus(b.id, 'Closed')}>✅ Confirmă</button>
                                <button className="btn-reject" onClick={() => handleStatus(b.id, 'Open')}>❌ Refuză</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button className="fab-btn" onClick={() => setShowModal(true)} title="Adaugă Bug">＋</button>
            {showModal && <AddBugModal onClose={() => setShowModal(false)} onSubmit={handleCreateBug} />}
        </div>
    );
}

export default Dashboard;