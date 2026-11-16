import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';

const LOW_STOCK = 2; // fewer than 2 copies is "low"

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/books')
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter((b) =>
    [b.title, b.author, b.genre].some((f) => f.toLowerCase().includes(search.toLowerCase())));
  const low = books.filter((b) => b.quantity < LOW_STOCK);
  const totalCopies = books.reduce((s, b) => s + b.quantity, 0);

  return (
    <section>
      <h1>Dashboard</h1>
      <Alert>{error}</Alert>
      {loading ? <p className="empty">Loading…</p> : (
        <>
          <div className="stats">
            <div className="stat"><strong>{books.length}</strong><span>Titles</span></div>
            <div className="stat"><strong>{totalCopies}</strong><span>Copies in stock</span></div>
            <div className="stat stat-warn"><strong>{low.length}</strong><span>Low / out of stock</span></div>
          </div>

          <div className="toolbar">
            <input type="search" placeholder="Search title, author or genre…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="toggle">
              <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
            </div>
          </div>

          {!filtered.length ? <p className="empty">No books match.</p> : view === 'cards' ? (
            <div className="card-grid">
              {filtered.map((b) => (
                <article key={b.id} className={`book-card ${b.quantity < LOW_STOCK ? 'low' : ''}`}>
                  <h3>{b.title}</h3>
                  <p className="muted">{b.author}</p>
                  <p><span className="badge">{b.genre}</span></p>
                  <p className="stock">
                    <strong>{b.quantity}</strong> in stock
                    {b.quantity === 0 ? <span className="badge badge-danger">Out of stock</span>
                      : b.quantity < LOW_STOCK && <span className="badge badge-warn">Low stock</span>}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>In stock</th></tr></thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className={b.quantity < LOW_STOCK ? 'low-row' : ''}>
                      <td data-label="Title">{b.title}</td>
                      <td data-label="Author">{b.author}</td>
                      <td data-label="Genre">{b.genre}</td>
                      <td data-label="ISBN">{b.isbn}</td>
                      <td data-label="In stock">
                        {b.quantity}{' '}
                        {b.quantity === 0 ? <span className="badge badge-danger">Out</span>
                          : b.quantity < LOW_STOCK && <span className="badge badge-warn">Low</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
