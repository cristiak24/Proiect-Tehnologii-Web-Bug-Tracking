import { useState } from 'react';

function Login({ onLoginSuccess }) {
    // Aici tin minte daca userul vrea sa se logheze sau sa isi faca cont
    const [isRegistering, setIsRegistering] = useState(false);

    // Variabilele pentru input-uri
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Aici tin minte erorile sau mesajul de succes ca sa le afisez
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Functia care trimite datele la server cand dau click pe buton
    const handleSubmit = async () => {
        // Fac curat la mesaje inainte sa incerc din nou
        setError('');
        setSuccessMsg('');

        // Vad unde trebuie sa trimit datele: la login sau la register
        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const payload = isRegistering
            ? { name, email, password }
            : { email, password };

        try {
            // Fac request-ul propriu-zisa catre backend (pe portul 3000)
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                // Daca e de bine
                if (isRegistering) {
                    setSuccessMsg("Gata, contul e facut! Acum poti sa intri pe el.");
                    setIsRegistering(false);
                    setPassword(''); // Ii sterg parola sa nu ramana acolo
                } else {
                    onLoginSuccess(data.user); // Il las sa intre in aplicatie
                }
            } else {
                // Daca a dat eroare serverul (de ex: parola gresita)
                setError(data.error || 'Ceva n-a mers bine.');
            }
        } catch (err) {
            setError('Nu am putut sa vorbesc cu serverul. E pornit?');
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