import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Aici ne conectăm la Backend-ul tău Node.js
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user); // Trimitem userul către App.jsx
      } else {
        setError(data.error || 'Date incorecte');
      }
    } catch (err) {
      setError('Nu pot contacta serverul (Verifică dacă rulează pe portul 3000)');
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <img src="/logo.png" alt="Ladybug" className="logo" />
        <h2>Bine ai venit!</h2>
        <p>Autentificare în LadyBug Tracker</p>

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <input 
          type="email" 
          placeholder="Email (ex: mp@test.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Parola" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Intră în Aplicație</button>
        
        <div style={{marginTop: '15px', fontSize: '0.8rem', color: '#888'}}>
          Conturi Demo: mp@test.com / 1234
        </div>
      </div>
    </div>
  );
}

export default Login;