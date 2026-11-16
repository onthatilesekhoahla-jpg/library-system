import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from './Alert.jsx';

export default function LoginForm() {
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) return setError('Enter your membership ID and password');
    setLoading(true); setError('');
    try {
      const result = await api.post('/users/login', form);
      login(result);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card login-card" onSubmit={submit} noValidate>
      <h2>Sign in</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <div className="form-group">
        <label htmlFor="l-mid">Membership ID</label>
        <input id="l-mid" name="membership_id" value={form.membership_id} onChange={change} autoComplete="username" />
      </div>
      <div className="form-group">
        <label htmlFor="l-pw">Password</label>
        <input id="l-pw" name="password" type="password" value={form.password} onChange={change} autoComplete="current-password" />
      </div>
      <button className="btn btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      <p className="hint">Demo: <code>ADMIN001</code> / <code>admin123</code> · <code>LIB001</code> / <code>librarian123</code> · <code>MEM001</code> / <code>member123</code></p>
    </form>
  );
}
