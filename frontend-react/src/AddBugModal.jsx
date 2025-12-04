import { useState } from 'react';

function AddBugModal({ onClose, onSubmit }) {
    const [desc, setDesc] = useState('');
    const [severity, setSeverity] = useState('Medium'); // Default
    const [link, setLink] = useState('');

    const handleSubmit = () => {
        if (!desc) return alert("Te rugăm să descrii problema!");
        
        onSubmit({
            description: desc,
            severity: severity,
            priority: 'High', 
            commit_link: link || 'Fără link'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}>&times;</button>
                
                <h2 style={{color: '#0f172a', marginTop: 0}}>🐞 Raportează o problemă</h2>
                <p style={{color: '#64748b'}}>Ajută-ne să curățăm grădina de dăunători.</p>

                {/* DESCRIERE */}
                <label style={{fontWeight: 'bold', display:'block', marginTop: '15px'}}>Ce s-a întâmplat?</label>
                <textarea 
                    placeholder="Ex: Când apăs pe butonul X, primesc eroare..."
                    style={{width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '5px', fontFamily: 'inherit'}}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                {/* PRIORITATE VIZUALĂ */}
                <label style={{fontWeight: 'bold', display:'block', marginTop: '15px'}}>Gravitate</label>
                <div className="priority-selector">
                    <div className={`prio-btn ${severity === 'Low' ? 'selected' : ''}`} onClick={() => setSeverity('Low')}>
                        🎨 <span className="prio-label">Mică</span>
                    </div>
                    <div className={`prio-btn ${severity === 'Medium' ? 'selected' : ''}`} onClick={() => setSeverity('Medium')}>
                        🐞 <span className="prio-label">Medie</span>
                    </div>
                    <div className={`prio-btn ${severity === 'Critical' ? 'selected' : ''}`} onClick={() => setSeverity('Critical')}>
                        🔥 <span className="prio-label">Critică</span>
                    </div>
                </div>

                {/* LINK */}
                <label style={{fontWeight: 'bold', display:'block', marginTop: '15px'}}>Link (Opțional)</label>
                <input 
                    type="text" 
                    placeholder="Link către commit sau screenshot..." 
                    style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '5px'}}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />

                <button 
                    onClick={handleSubmit} 
                    className="btn-primary" 
                    style={{width: '100%', marginTop: '20px'}}
                >
                    Trimite Raportul 🚀
                </button>
            </div>
        </div>
    );
}

export default AddBugModal;