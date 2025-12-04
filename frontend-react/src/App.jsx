import { useState } from 'react';
import './index.css';
import Login from './login';
import Dashboard from './Dashboard';
import Navbar from './Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stare globală pentru navigare (ca să meargă Logo-ul)
  // key: forțează re-randarea Dashboard-ului când dăm click pe logo
  const [dashboardKey, setDashboardKey] = useState(0); 

  const handleGoHome = () => {
    setSearchQuery(''); // Resetăm căutarea
    setDashboardKey(prev => prev + 1); // Resetăm Dashboard-ul la ecranul principal
  };

  // Dacă nu e logat, arată Login
  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="app-layout">
        <Navbar 
            user={user} 
            onLogout={() => setUser(null)} 
            onSearch={(text) => setSearchQuery(text)}
            onLogoClick={handleGoHome} // <--- Funcția nouă pentru Logo
        />
        
        <main className="main-content">
            {/* Folosim key pentru a reseta Dashboard-ul când apăsăm pe Logo */}
            <Dashboard 
                key={dashboardKey} 
                user={user} 
                searchQuery={searchQuery} 
            />
        </main>
    </div>
  );
}

export default App;