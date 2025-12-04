import { useState, useEffect } from 'react';

function Dashboard({ user, searchQuery }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [newProjName, setNewProjName] = useState('');
    const [newProjRepo, setNewProjRepo] = useState('');
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/projects');
            const data = await res.json();
            setProjects(data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    // --- ACȚIUNI ---
    const handleCreateProject = async () => {
        if (!newProjName) return alert("Numele proiectului e obligatoriu!");
        
        await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newProjName, repository: newProjRepo, owner_id: user.id })
        });
        setNewProjName(''); setNewProjRepo('');
        loadProjects(); // Refresh
        alert("Proiect creat! Ești MP.");
    };

    const handleJoinCode = async () => {
        const res = await fetch('http://localhost:3000/api/projects/join-code', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id, code: joinCode })
        });
        const data = await res.json();
        if(res.ok) {
            alert(data.message);
            setJoinCode('');
            loadProjects();
        } else {
            alert(data.error);
        }
    };

    const handleJoinTester = async (projId) => {
        if(!confirm("Vrei să devii Tester la acest proiect?")) return;
        await fetch(`http://localhost:3000/api/projects/${projId}/join`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id })
        });
        loadProjects();
    };

    // --- FILTRARE PENTRU AFISARE ---
    // 1. Filtrăm după Search Bar
    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Împărțim în "Ale Mele" și "Feed"
    const myProjects = filteredProjects.filter(p => 
        p.ProjectMembers.some(m => m.user_id === user.id)
    );
    
    const feedProjects = filteredProjects.filter(p => 
        !p.ProjectMembers.some(m => m.user_id === user.id)
    );

    if (loading) return <p>Se încarcă dashboard-ul...</p>;

    return (
        <div className="dashboard-container">
            
            {/* SECȚIUNEA 1: ACȚIUNI RAPIDE */}
            <div className="actions-grid">
                <div className="action-card create-card">
                    <h3>🚀 Creează Proiect Nou</h3>
                    <input 
                        placeholder="Nume Proiect" 
                        value={newProjName} onChange={e => setNewProjName(e.target.value)} 
                    />
                    <input 
                        placeholder="Link Repository (GitHub)" 
                        value={newProjRepo} onChange={e => setNewProjRepo(e.target.value)} 
                    />
                    <button onClick={handleCreateProject} className="btn-primary">Creează (Devino MP)</button>
                </div>

                <div className="action-card join-card">
                    <h3>🔑 Ai un cod de la un coleg?</h3>
                    <p>Introdu codul unic pentru a intra în echipă.</p>
                    <input 
                        placeholder="Ex: A7X92B" 
                        value={joinCode} onChange={e => setJoinCode(e.target.value)} 
                    />
                    <button onClick={handleJoinCode} className="btn-secondary">Join Proiect</button>
                </div>
            </div>

            <hr className="divider" />

            {/* SECȚIUNEA 2: PROIECTELE MELE */}
            <h2 className="section-title">📂 Proiectele Mele ({myProjects.length})</h2>
            <div className="projects-grid">
                {myProjects.length === 0 ? <p className="empty-text">Nu ești implicat în niciun proiect.</p> : null}
                
                {myProjects.map(p => {
                    const myRole = p.ProjectMembers.find(m => m.user_id === user.id).role;
                    return (
                        <div key={p.id} className="project-card my-project">
                            <div className="card-header">
                                <h4>{p.name}</h4>
                                <span className={`badge ${myRole === 'MP' ? 'badge-mp' : 'badge-tst'}`}>{myRole}</span>
                            </div>
                            <small>Repo: {p.repository || 'N/A'}</small>
                            
                            {myRole === 'MP' && (
                                <div className="code-box">
                                    Cod Invitație: <strong>{p.join_code}</strong>
                                </div>
                            )}
                            
                            <button className="btn-open">Deschide Proiect</button>
                        </div>
                    );
                })}
            </div>

            <hr className="divider" />

            {/* SECȚIUNEA 3: FEED PUBLIC */}
            <h2 className="section-title">🌍 Feed Public - Devino Tester</h2>
            <div className="projects-grid">
                {feedProjects.map(p => (
                    <div key={p.id} className="project-card feed-project">
                        <h4>{p.name}</h4>
                        <p>Caută testeri!</p>
                        <button onClick={() => handleJoinTester(p.id)} className="btn-outline">
                            👋 Join as Tester
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;