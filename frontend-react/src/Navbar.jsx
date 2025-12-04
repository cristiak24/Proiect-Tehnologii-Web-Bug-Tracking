import { useState } from 'react';

function Navbar({ user, onLogout, onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        onSearch(val); // Trimitem textul în sus către App/Dashboard
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <img src="/logo.png" alt="Logo" className="logo-img" style={{height: '35px'}}/>
                <h1 style={{fontSize: '1.2rem', margin:0}}>LadyBug <span className="highlight">Tracker</span></h1>
            </div>

            {/* SEARCH BAR */}
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="🔍 Caută proiecte sau colegi..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* USER PROFILE AREA */}
            <div className="user-panel">
                <div className="user-info">
                    <span className="user-name">{user.email}</span>
                    <small>Student</small>
                </div>
                <button onClick={onLogout} className="btn-logout">Deconectare</button>
            </div>
        </nav>
    );
}

export default Navbar;