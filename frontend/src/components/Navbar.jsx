import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const staff = user && ['admin', 'librarian'].includes(user.role);
  const close = () => setOpen(false);

  const handleLogout = () => { logout(); close(); navigate('/users'); };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">Library<span>MS</span></span>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {user && <NavLink to="/" end onClick={close}>Dashboard</NavLink>}
          {staff && <NavLink to="/books" onClick={close}>Book Management</NavLink>}
          {staff && <NavLink to="/transactions" onClick={close}>Transactions</NavLink>}
          <NavLink to="/users" onClick={close}>{user?.role === 'admin' ? 'User Management' : 'Account'}</NavLink>
          {user && (
            <span className="nav-user">
              {user.name} <span className={`badge role-${user.role}`}>{user.role}</span>
              <button className="btn btn-small btn-outline" onClick={handleLogout}>Logout</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
