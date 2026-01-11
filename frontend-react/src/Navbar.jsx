import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, X, LogOut, User, Bell, Check, XCircle } from 'lucide-react';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const [showInvites, setShowInvites] = useState(false);

    // Fetch invitations on mount (and periodically if needed)
    const fetchInvitations = async () => {
        try {
            if (!user?.id) return;
            const res = await fetch(`http://localhost:3000/api/projects/invitations?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setInvitations(data);
            }
        } catch (err) {
            console.error("Failed to fetch invites", err);
        }
    };

    useEffect(() => {
        fetchInvitations();
        // Poll every 30s
        const interval = setInterval(fetchInvitations, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleAccept = async (projectId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/accept-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            if (res.ok) {
                fetchInvitations();
                alert("Te-ai alăturat proiectului!");
                // Optionally refresh projects list in dashboard via context or reload
                window.location.reload();
            }
        } catch (err) { console.error(err); }
    };

    const handleDecline = async (projectId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/decline-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            if (res.ok) {
                fetchInvitations();
            }
        } catch (err) { console.error(err); }
    };

    const handleSearch = (e) => {
        const text = e.target.value;
        if (text) setSearchParams({ q: text });
        else setSearchParams({});
        if (window.location.pathname !== '/') navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* 1. LOGO & TOGGLE */}
                <div className="nav-header">
                    <div className="nav-brand" onClick={() => navigate('/')}>
                        <div className="logo-icon">
                            <img src="/logo.png" alt="LB" onError={(e) => e.target.style.display = 'none'} />
                            <span>🐞</span>
                        </div>
                        <span className="logo-text">LadyBug <span style={{ color: 'var(--primary)' }}>Tracker</span></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* BELL ICON (Visible on Mobile too) */}
                        <div className="mobile-bell-container" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowInvites(!showInvites)}>
                            <Bell size={24} color={invitations.length > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
                            {invitations.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: 'var(--danger)', color: 'white',
                                    borderRadius: '50%', width: '16px', height: '16px',
                                    fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {invitations.length}
                                </span>
                            )}

                            {/* DROPDOWN */}
                            {showInvites && (
                                <div className="glass-panel" style={{
                                    position: 'absolute', top: '35px', right: '-10px',
                                    width: '280px', padding: '10px', zIndex: 1001,
                                    display: 'flex', flexDirection: 'column', gap: '5px'
                                }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Invitații ({invitations.length})</h4>
                                    {invitations.length === 0 ? (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nu ai invitații noi.</div>
                                    ) : (
                                        invitations.map(inv => (
                                            <div key={inv.id} style={{
                                                background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px',
                                                display: 'flex', flexDirection: 'column', gap: '5px'
                                            }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{inv.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>De la: {inv.ownerName}</div>
                                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); handleAccept(inv.id); }}>
                                                        <Check size={12} style={{ marginRight: '4px' }} /> Accept
                                                    </button>
                                                    <button className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); handleDecline(inv.id); }}>
                                                        <XCircle size={12} style={{ marginRight: '4px' }} /> Refuză
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* 2. MENU ITEMS (Search + User) */}
                <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>

                    {/* SEARCH BAR */}
                    <div className="nav-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Caută proiecte..."
                            onChange={handleSearch}
                            value={searchParams.get('q') || ''}
                            className="nav-search-input"
                        />
                    </div>

                    {/* USER INFO */}
                    <div className="nav-user-section">
                        <div
                            className="user-profile-link"
                            onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                        >
                            <div className="user-avatar-placeholder">{user.name?.[0] || 'U'}</div>
                            <span className="user-name-text">{user.name || user.email.split('@')[0]}</span>
                        </div>

                        {/* DESKTOP BELL (Hidden on Mobile) */}
                        <div className="desktop-bell-container" style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowInvites(!showInvites)}>
                            <Bell size={20} color={invitations.length > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
                            {invitations.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: 'var(--danger)', color: 'white',
                                    borderRadius: '50%', width: '14px', height: '14px',
                                    fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {invitations.length}
                                </span>
                            )}
                            {/* DROPDOWN (Desktop) */}
                            {showInvites && (
                                <div className="glass-panel" style={{
                                    position: 'absolute', top: '35px', right: '0',
                                    width: '300px', padding: '15px', zIndex: 1001,
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}>
                                    <h4 style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Invitații ({invitations.length})</h4>
                                    {invitations.length === 0 ? (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nu ai invitații noi.</div>
                                    ) : (
                                        invitations.map(inv => (
                                            <div key={inv.id} style={{
                                                background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px',
                                                display: 'flex', flexDirection: 'column', gap: '8px'
                                            }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{inv.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>De la: {inv.ownerName}</div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1, borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleAccept(inv.id); }}>
                                                        <Check size={14} style={{ marginRight: '4px' }} /> Accept
                                                    </button>
                                                    <button className="btn-danger" style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1, borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleDecline(inv.id); }}>
                                                        <XCircle size={14} style={{ marginRight: '4px' }} /> Refuză
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={onLogout} className="btn-logout">
                            <LogOut size={16} />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;