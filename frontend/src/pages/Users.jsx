import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';

function AdminView({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.get('/users').then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn, msg) => {
    try { await fn(); setError(''); setSuccess(msg); await load(); return true; }
    catch (e) { setSuccess(''); setError(e.message); return false; }
  };

  const add = (u) => run(() => api.post('/users', u), 'User added.');
  const update = async (u) => {
    const ok = await run(() => api.put(`/users/${editing.id}`, u), 'User updated.');
    if (ok) setEditing(null);
    return ok;
  };
  const remove = (u) => {
    if (u.id === currentUser.id) return setError('You cannot delete your own account.');
    if (window.confirm(`Delete user "${u.name}"?`)) run(() => api.del(`/users/${u.id}`), 'User deleted.');
  };

  return (
    <>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      {editing
        ? <UserForm key={editing.id} initial={editing} onSubmit={update} onCancel={() => setEditing(null)} />
        : <UserForm onSubmit={add} />}
      <h2>All Users</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-label="Name">{u.name}</td>
                <td data-label="Membership ID">{u.membership_id}</td>
                <td data-label="Role"><span className={`badge role-${u.role}`}>{u.role}</span></td>
                <td data-label="Actions" className="actions">
                  <button className="btn btn-small" onClick={() => { setEditing(u); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Users() {
  const { user } = useAuth();
  return (
    <section>
      <h1>{user?.role === 'admin' ? 'User Management' : 'Account'}</h1>
      {!user && <LoginForm />}
      {user && user.role !== 'admin' && (
        <div className="card">
          <h2>Welcome, {user.name}</h2>
          <p>Membership ID: <strong>{user.membership_id}</strong></p>
          <p>Role: <span className={`badge role-${user.role}`}>{user.role}</span></p>
          <p className="muted">Only administrators can manage users.</p>
        </div>
      )}
      {user?.role === 'admin' && <AdminView currentUser={user} />}
    </section>
  );
}
