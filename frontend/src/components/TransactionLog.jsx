export default function TransactionLog({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <p className="empty">No transactions yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>Member</th><th>Actions</th></tr></thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Type"><span className={`badge ${t.type === 'add' ? 'badge-ok' : 'badge-warn'}`}>{t.type === 'add' ? 'Stock added' : 'Borrowed'}</span></td>
              <td data-label="Qty">{t.type === 'add' ? `+${t.quantity}` : `−${t.quantity}`}</td>
              <td data-label="Member">{t.user_name || '—'}</td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-small" onClick={() => onEdit(t)} disabled={!t.book_id}>Edit</button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
