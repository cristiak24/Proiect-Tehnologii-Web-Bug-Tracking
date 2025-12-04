import { useState } from 'react';
import Login from './login';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dacă nu e logat, arată Login
  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  // Dacă e logat, arată SPA-ul (Navbar + Dashboard)
  return (
    <div className="app-layout">
        <Navbar 
            user={user} 
            onLogout={() => setUser(null)} 
            onSearch={(text) => setSearchQuery(text)}
        />
        
        <main className="main-content">
            <Dashboard user={user} searchQuery={searchQuery} />
        </main>
    </div>
  );
}

export default App;