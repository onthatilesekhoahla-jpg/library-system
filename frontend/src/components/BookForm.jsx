import { useState } from 'react';

const empty = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Controlled form with client-side validation. Used for adding books.
export default function BookForm({ onSubmit }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.genre.trim()) e.genre = 'Genre is required';
    if (!/^[0-9-]{10,17}$/.test(form.isbn.trim())) e.isbn = 'ISBN must be 10–17 digits (hyphens allowed)';
    if (form.quantity === '' || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = 'Enter a whole number (0 or more)';
    return e;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    const ok = await onSubmit({ ...form, quantity: Number(form.quantity) });
    setSubmitting(false);
    if (ok) setForm(empty);
  };

  const field = (name, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label htmlFor={`book-${name}`}>{label}</label>
      <input id={`book-${name}`} name={name} type={type} value={form[name]} onChange={handleChange}
             className={errors[name] ? 'invalid' : ''} {...extra} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </div>
  );

  return (
    <form className="card form-grid" onSubmit={handleSubmit} noValidate>
      <h2 className="span-all">Add New Book</h2>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre')}
      {field('isbn', 'ISBN')}
      {field('quantity', 'Initial Quantity', 'number', { min: 0 })}
      <div className="form-group form-actions">
        <button className="btn" disabled={submitting}>{submitting ? 'Adding…' : 'Add Book'}</button>
      </div>
    </form>
  );
}
