import { useState } from 'react';

// Editable table: each row can switch into edit mode (Update / Cancel) or be deleted.
export default function BookList({ books, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [rowError, setRowError] = useState('');

  const startEdit = (b) => { setEditingId(b.id); setDraft({ ...b }); setRowError(''); };
  const cancel = () => { setEditingId(null); setRowError(''); };
  const change = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const save = async () => {
    if (!draft.title.trim() || !draft.author.trim() || !draft.genre.trim() || !draft.isbn.trim())
      return setRowError('All fields are required');
    if (!Number.isInteger(Number(draft.quantity)) || Number(draft.quantity) < 0)
      return setRowError('Quantity must be a whole number (0 or more)');
    const ok = await onUpdate(draft.id, { ...draft, quantity: Number(draft.quantity) });
    if (ok) cancel();
  };

  if (!books.length) return <p className="empty">No books found.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {books.map((b) => editingId === b.id ? (
            <tr key={b.id} className="editing">
              {['title', 'author', 'genre', 'isbn'].map((f) => (
                <td key={f} data-label={f}><input name={f} value={draft[f]} onChange={change} /></td>
              ))}
              <td data-label="Qty"><input name="quantity" type="number" min="0" value={draft.quantity} onChange={change} className="qty-input" /></td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-small" onClick={save}>Update</button>
                <button className="btn btn-small btn-outline" onClick={cancel}>Cancel</button>
                {rowError && <small className="field-error">{rowError}</small>}
              </td>
            </tr>
          ) : (
            <tr key={b.id}>
              <td data-label="Title">{b.title}</td>
              <td data-label="Author">{b.author}</td>
              <td data-label="Genre">{b.genre}</td>
              <td data-label="ISBN">{b.isbn}</td>
              <td data-label="Qty">{b.quantity}</td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-small" onClick={() => startEdit(b)}>Edit</button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
