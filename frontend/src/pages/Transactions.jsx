import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import StockForm from '../components/StockForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const load = () => Promise.all([api.get('/books'), api.get('/users'), api.get('/transactions')])
    .then(([b, u, t]) => { setBooks(b); setUsers(u); setTransactions(t); })
    .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const record = async (data) => {
    try {
      const result = editing
        ? await api.put(`/transactions/${editing.id}`, data)
        : await api.post('/transactions', data);
      setError('');
      setSuccess(editing ? 'Transaction updated and stock recalculated.' : `${data.type === 'add' ? 'Added' : 'Deducted'} ${data.quantity} — "${result.book?.title || 'book'}" stock updated.`);
      setEditing(null);
      await load();
      return true;
    } catch (e) { setSuccess(''); setError(e.message); return false; }
  };

  const remove = async (transaction) => {
    if (!window.confirm(`Delete this ${transaction.type} transaction for "${transaction.book_title}"? Stock will be adjusted.`)) return;
    try {
      const result = await api.del(`/transactions/${transaction.id}`);
      setError(''); setSuccess(result.message); if (editing?.id === transaction.id) setEditing(null);
      await load();
    } catch (e) { setSuccess(''); setError(e.message); }
  };

  return (
    <section>
      <h1>Transactions</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <StockForm key={editing?.id || 'new'} books={books} users={users} onSubmit={record} initial={editing} onCancel={() => setEditing(null)} />
      <h2>Transaction History</h2>
      <TransactionLog transactions={transactions} onEdit={setEditing} onDelete={remove} />
    </section>
  );
}
