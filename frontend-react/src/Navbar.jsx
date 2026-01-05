import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSearch = (e) => {
        const text = e.target.value;
        if (text) setSearchParams({ q: text });
        else setSearchParams({});

        // If not on dashboard, maybe redirect? Or just let context filter?
        // Let's assume dashboard listens to query param everywhere or user is on dashboard.
        // For better UX, if user types, go to dashboard
        if (window.location.pathname !== '/') navigate('/');
    };

    return (
        <nav className="navbar">
            {/* LOGO CLICKABIL (Home) */}
            <div className="nav-brand" onClick={() => navigate('/')}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '5px', borderRadius: '8px', display: 'flex' }}>
                    <img src="/logo.png" alt="LB" style={{ height: '24px' }} onError={(e) => e.target.style.display = 'none'} />
                    {/* Fallback icon if no logo */}
                    <span style={{ fontSize: '1.2rem' }}>🐞</span>
                </div>
                <span>LadyBug <span style={{ color: 'var(--primary)' }}>Tracker</span></span>
            </div>

            {/* SEARCH BAR */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search projects..."
                    onChange={handleSearch}
                    value={searchParams.get('q') || ''}
                    className="input-field"
                    style={{ paddingLeft: '40px', background: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }}
                />
            </div>

            {/* USER INFO */}
            <div className="nav-user">
                <span className="user-name" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {user.name || user.email.split('@')[0]}
                </span>
                <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Log out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;