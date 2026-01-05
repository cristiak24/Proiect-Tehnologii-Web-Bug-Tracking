import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import './index.css';
import Login from './login';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ProjectDetails from './pages/ProjectDetails'; // We will create this

// Layout wraper with Navbar
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

// Protected Route Wrapper
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  // Simple persistence for demo
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