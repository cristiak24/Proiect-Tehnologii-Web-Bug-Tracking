import { useState } from 'react';

function Navbar({ user, onLogout, onSearch, onLogoClick }) {
    
    const handleSearch = (e) => {
        onSearch(e.target.value);
    };

    return (
        <nav className="navbar">
            {/* LOGO CLICKABIL (Home) */}
            <div className="nav-brand" onClick={onLogoClick} style={{cursor: 'pointer'}}>
                <img src="/logo.png" alt="Logo" className="logo-img" style={{height: '35px'}}/>
                <h1 style={{fontSize: '1.2rem', margin:0}}>LadyBug <span className="highlight">Tracker</span></h1>
            </div>

            {/* SEARCH BAR */}
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="🔍 Caută proiecte..." 
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* USER INFO SIMPLIFICAT (Doar Nume) */}
            <div className="user-panel">
                <div className="user-info">
                    {/* Afișăm Numele. Dacă nu are nume setat, afișăm partea dinainte de @ din email */}
                    <span className="user-name" style={{fontSize: '1rem'}}>
                        Salut, {user.name || user.email.split('@')[0]} 👋
                    </span>
                </div>
                <button onClick={onLogout} className="btn-logout">Ieșire</button>
            </div>
        </nav>
    );
}

export default Navbar;