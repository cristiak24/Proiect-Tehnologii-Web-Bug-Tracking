import { useState, useEffect } from 'react';
import { User, Mail, Github, Save } from 'lucide-react';
import { API_BASE_URL } from '../config';

function MyProfile({ user }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
        github: user?.github || ''
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'invitations'
    const [invitations, setInvitations] = useState([]);

    const fetchInvitations = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/projects/invitations?userId=${user.id}`);
            if (res.ok) setInvitations(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (activeTab === 'invitations') fetchInvitations();
    }, [activeTab, user]);

    const handleAccept = async (projectId) => {
        try {
            await fetch(`${API_BASE_URL}/api/projects/${projectId}/accept-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            fetchInvitations();
            alert("Invitație acceptată!");
        } catch (e) { console.error(e); }
    };

    const handleDecline = async (projectId) => {
        try {
            await fetch(`${API_BASE_URL}/api/projects/${projectId}/decline-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            fetchInvitations();
        } catch (e) { console.error(e); }
    };

    // Update form when user prop updates
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatar: user.avatar || '', // Assuming backend has avatar field, or we use placeholder
                github: user.github || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Backend endpoint PUT /api/auth/me needs to be implemented or confirmed
            // For now, we'll try to use a standard convention or mock it if needed.
            // The user asked for "My Profile" feature, implying I should build the UI.
            // I'll assume I need to add the backend route too.

            const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Profil actualizat! (Te rog dă refresh sau relogare pentru a vedea schimbările complet)");
                // In a real app, we would update the parent user state here.
            } else {
                alert("Eroare la actualizare.");
            }
        } catch (err) {
            console.error(err);
            alert("Eroare de conexiune.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        background: 'none', border: 'none', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', padding: '5px 10px',
                        borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : 'none'
                    }}
                >
                    Profil
                </button>
                <button
                    onClick={() => setActiveTab('invitations')}
                    style={{
                        background: 'none', border: 'none', color: activeTab === 'invitations' ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', padding: '5px 10px',
                        borderBottom: activeTab === 'invitations' ? '2px solid var(--primary)' : 'none'
                    }}
                >
                    Invitații {invitations.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.8rem', marginLeft: '5px' }}>{invitations.length}</span>}
                </button>
            </div>

            {activeTab === 'profile' ? (
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: 'var(--primary)', margin: '0 auto 15px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', fontWeight: 'bold'
                        }}>
                            {formData.avatar ? <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : formData.name[0]}
                        </div>
                        <h1>Profilul Meu</h1>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                <User size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Nume Complet
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                <Mail size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Email
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                disabled // Usually email update requires verification
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                <Github size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                GitHub URL
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.github}
                                onChange={e => setFormData({ ...formData, github: e.target.value })}
                                placeholder="https://github.com/username"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                URL Poză Profil
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.avatar}
                                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                placeholder="http://example.com/me.jpg"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                            disabled={loading}
                        >
                            <Save size={18} /> {loading ? 'Se salvează...' : 'Salvează Modificări'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2>Invitații Proiecte</h2>
                    {invitations.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Nu ai invitații în așteptare.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {invitations.map(inv => (
                                <div key={inv.id} style={{
                                    background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {inv.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{inv.name}</div>
                                            <div style={{ color: 'var(--text-muted)' }}>Invitat de: {inv.ownerName}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-primary" onClick={() => handleAccept(inv.id)}>Confirmă</button>
                                        <button className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDecline(inv.id)}>Refuză</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyProfile;
