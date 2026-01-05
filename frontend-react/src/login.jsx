import { useState } from 'react';

function Login({ onLoginSuccess }) {
    // Stare (Switch între Login și Register)
    const [isRegistering, setIsRegistering] = useState(false);

    // Datele formularului
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Mesaje de feedback
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    //TRIMITERE DATE CĂTRE SERVER 
    const handleSubmit = async () => {
        // Resetăm erorile vechi înainte de a trimite
        setError('');
        setSuccessMsg('');

        // Pregătim datele
        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const payload = isRegistering
            ? { name, email, password }
            : { email, password };

        try {
            // Trimitem totul la Backend ("Polițistul") și îl lăsăm pe el să verifice
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                // SUCCES
                if (isRegistering) {
                    setSuccessMsg("Cont creat cu succes! Conectează-te acum.");
                    setIsRegistering(false);
                    setPassword('');
                } else {
                    onLoginSuccess(data.user);
                }
            } else {
                // EROARE (Aici afișăm exact ce ne-a zis backend-ul: "Parola prea scurtă", etc.)
                setError(data.error || 'A apărut o eroare.');
            }
        } catch (err) {
            setError('Nu pot contacta serverul.');
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="login-container">
            <div className="glass-panel auth-box">
                <img src="/logo.png" alt="Ladybug" className="logo" />

                <h2>{isRegistering ? 'Creează Cont' : 'Bine ai venit!'}</h2>
                <p>{isRegistering ? 'Alătură-te echipei' : 'Autentificare în sistem'}</p>

                {/* Feedback vizual */}
                {error && <div style={{ color: '#e11d48', background: '#fff1f2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>⚠️ {error}</div>}
                {successMsg && <div style={{ color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>✅ {successMsg}</div>}

                {/* Formular Simplificat */}
                {isRegistering && (
                    <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginLeft: '5px', marginBottom: '5px', color: 'var(--text-muted)' }}>Nume</label>
                        <input className="input-field" type="text" placeholder="Numele tău" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                )}

                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginLeft: '5px', marginBottom: '5px', color: 'var(--text-muted)' }}>Email</label>
                    <input className="input-field" type="email" placeholder="email@exemplu.ro" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginLeft: '5px', marginBottom: '5px', color: 'var(--text-muted)' }}>Parolă</label>
                    <input className="input-field" type="password" placeholder="••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {isRegistering ? 'Înregistrează-te' : 'Intră în Aplicație'}
                </button>

                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                    <span onClick={toggleMode} style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isRegistering ? 'Mergi la Conectare' : 'Creează un cont nou'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Login;