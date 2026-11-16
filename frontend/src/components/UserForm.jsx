import { useState } from 'react';

const empty = { name: '', membership_id: '', role: 'member', password: '' };

// Used for both adding (no `initial`) and updating (with `initial`) users.
export default function UserForm({ initial, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(initial ? { ...initial, password: '' } : empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.name.trim()) v.name = 'Name is required';
    if (!form.membership_id.trim()) v.membership_id = 'Membership ID is required';
    if (!editing && form.password.length < 6) v.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) v.password = 'Password must be at least 6 characters';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    const ok = await onSubmit(form);
    setSubmitting(false);
    if (ok && !editing) setForm(empty);
  };

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <h2 className="span-all">{editing ? 'Update User' : 'Add New User'}</h2>
      <div className="form-group">
        <label htmlFor="u-name">Name</label>
        <input id="u-name" name="name" value={form.name} onChange={change} className={errors.name ? 'invalid' : ''} />
        {errors.name && <small className="field-error">{errors.name}</small>}
      </div>
      <div className="form-group">
        <label htmlFor="u-mid">Membership ID</label>
        <input id="u-mid" name="membership_id" value={form.membership_id} onChange={change} className={errors.membership_id ? 'invalid' : ''} />
        {errors.membership_id && <small className="field-error">{errors.membership_id}</small>}
      </div>
      <div className="form-group">
        <label htmlFor="u-role">Role</label>
        <select id="u-role" name="role" value={form.role} onChange={change}>
          <option value="member">Member</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="u-pw">{editing ? 'New password (optional)' : 'Password'}</label>
        <input id="u-pw" name="password" type="password" value={form.password} onChange={change} className={errors.password ? 'invalid' : ''} />
        {errors.password && <small className="field-error">{errors.password}</small>}
      </div>
      <div className="form-group form-actions">
        <button className="btn" disabled={submitting}>{editing ? 'Save Changes' : 'Add User'}</button>
        {editing && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
