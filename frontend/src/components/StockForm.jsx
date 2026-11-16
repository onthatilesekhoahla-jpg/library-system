import { useState } from 'react';

// Used to create or edit stock transactions.
export default function StockForm({ books, users, onSubmit, initial, onCancel }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(initial
    ? { book_id: String(initial.book_id || ''), user_id: String(initial.user_id || ''), type: initial.type, quantity: initial.quantity }
    : { book_id: '', user_id: '', type: 'add', quantity: 1 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.book_id) v.book_id = 'Select a book';
    if (form.type === 'borrow' && !form.user_id) v.user_id = 'Select the borrower';
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) v.quantity = 'Quantity must be at least 1';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    const ok = await onSubmit({ book_id: Number(form.book_id), user_id: form.type === 'borrow' ? Number(form.user_id) : null, type: form.type, quantity: Number(form.quantity) });
    setSubmitting(false);
    if (ok && !editing) setForm({ book_id: '', user_id: '', type: 'add', quantity: 1 });
  };

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <h2 className="span-all">{editing ? 'Edit Transaction' : 'Record Transaction'}</h2>
      <div className="form-group">
        <label htmlFor="tx-type">Action</label>
        <select id="tx-type" name="type" value={form.type} onChange={change}>
          <option value="add">Add stock (new arrivals)</option>
          <option value="borrow">Deduct stock (book borrowed)</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="tx-book">Book</label>
        <select id="tx-book" name="book_id" value={form.book_id} onChange={change} className={errors.book_id ? 'invalid' : ''}>
          <option value="">— select a book —</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title} (in stock: {b.quantity})</option>)}
        </select>
        {errors.book_id && <small className="field-error">{errors.book_id}</small>}
      </div>
      {form.type === 'borrow' && <div className="form-group">
        <label htmlFor="tx-user">Borrower</label>
        <select id="tx-user" name="user_id" value={form.user_id} onChange={change} className={errors.user_id ? 'invalid' : ''}>
          <option value="">— select a member —</option>
          {users.filter((u) => u.role === 'member').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
        </select>
        {errors.user_id && <small className="field-error">{errors.user_id}</small>}
      </div>}
      <div className="form-group">
        <label htmlFor="tx-qty">Quantity</label>
        <input id="tx-qty" name="quantity" type="number" min="1" value={form.quantity} onChange={change} className={errors.quantity ? 'invalid' : ''} />
        {errors.quantity && <small className="field-error">{errors.quantity}</small>}
      </div>
      <div className="form-group form-actions">
        <button className="btn" disabled={submitting}>{submitting ? 'Saving…' : editing ? 'Save Changes' : 'Record'}</button>
        {editing && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
