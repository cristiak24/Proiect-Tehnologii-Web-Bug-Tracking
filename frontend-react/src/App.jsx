import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import './index.css';
import Login from './login';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ProjectDetails from './pages/ProjectDetails';
import MyProfile from './pages/MyProfile';

// Layout principal care contine Navbar-ul
const Layout = ({ user, onLogout }) => {
  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={onLogout} />
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
};

// Wrapper pentru rute protejate (sa nu intri daca nu esti logat)
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  // Tinem minte userul in localStorage ca sa nu dea logout la refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Aici definesc toate paginile aplicatiei
  const router = createBrowserRouter([
    {
      path: "/login",
      element: !user ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" replace />
    },
    {
      path: "/",
      element: (
        <ProtectedRoute user={user}>
          <Layout user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Dashboard user={user} />
        },
        {
          path: "/project/:id",
          element: <ProjectDetails user={user} />
        },
        {
          path: "/profile",
          element: <MyProfile user={user} />
        }
      ]
    },
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;