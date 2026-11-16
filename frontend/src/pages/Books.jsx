import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.get('/books').then(setBooks).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const notify = (msg) => { setError(''); setSuccess(msg); };

  const addBook = async (data) => {
    try { await api.post('/books', data); notify('Book added.'); await load(); return true; }
    catch (e) { setSuccess(''); setError(e.message); return false; }
  };

  const updateBook = async (id, data) => {
    try { await api.put(`/books/${id}`, data); notify('Book updated.'); await load(); return true; }
    catch (e) { setSuccess(''); setError(e.message); return false; }
  };

  const deleteBook = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try { await api.del(`/books/${book.id}`); notify('Book deleted.'); await load(); }
    catch (e) { setSuccess(''); setError(e.message); }
  };

  return (
    <section>
      <h1>Book Management</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <BookForm onSubmit={addBook} />
      <h2>All Books</h2>
      {loading ? <p className="empty">Loading…</p> : <BookList books={books} onUpdate={updateBook} onDelete={deleteBook} />}
    </section>
  );
}
