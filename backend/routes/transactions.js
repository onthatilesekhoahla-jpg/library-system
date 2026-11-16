const express = require('express');
const pool = require('../db/pool');
const router = express.Router();
const { authenticate, allowRoles } = require('../middleware/auth');

const validInput = (body) => {
  const qty = Number(body.quantity);
  if (!body.book_id) return 'book_id is required';
  if (!['add', 'borrow'].includes(body.type)) return "type must be 'add' or 'borrow'";
  if (!Number.isInteger(qty) || qty < 1) return 'quantity must be a whole number of at least 1';
  if (body.type === 'borrow' && !body.user_id) return 'user_id is required when borrowing';
  return null;
};
const effect = (type, quantity) => type === 'add' ? Number(quantity) : -Number(quantity);

router.get('/', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const { rows } = req.query.book_id
      ? await pool.query('SELECT * FROM transactions WHERE book_id=$1 ORDER BY created_at DESC, id DESC', [req.query.book_id])
      : await pool.query('SELECT * FROM transactions ORDER BY created_at DESC, id DESC LIMIT 200');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  const problem = validInput(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const { book_id, user_id, type } = req.body;
  const qty = Number(req.body.quantity);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookRes = await client.query('SELECT * FROM books WHERE id=$1 FOR UPDATE', [book_id]);
    if (!bookRes.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Book not found' }); }
    const book = bookRes.rows[0];
    let userName = null;
    if (user_id) {
      const u = await client.query('SELECT name FROM users WHERE id=$1', [user_id]);
      if (!u.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'User not found' }); }
      userName = u.rows[0].name;
    }
    if (type === 'borrow' && book.quantity < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Only ${book.quantity} ${book.quantity === 1 ? 'copy' : 'copies'} of "${book.title}" available` });
    }
    const updated = await client.query('UPDATE books SET quantity=quantity+$1 WHERE id=$2 RETURNING *', [effect(type, qty), book_id]);
    const tx = await client.query(
      `INSERT INTO transactions (book_id, book_title, user_id, user_name, type, quantity)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [book_id, book.title, user_id || null, userName, type, qty]
    );
    await client.query('COMMIT');
    res.status(201).json({ transaction: tx.rows[0], book: updated.rows[0] });
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); next(e); }
  finally { client.release(); }
});

// UPDATE: reverse the old stock movement and apply the replacement movement atomically.
router.put('/:id', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  const problem = validInput(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const { book_id, user_id, type } = req.body;
  const qty = Number(req.body.quantity);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const oldRes = await client.query('SELECT * FROM transactions WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!oldRes.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Transaction not found' }); }
    const old = oldRes.rows[0];
    if (!old.book_id) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'This transaction refers to a deleted book and cannot be edited.' }); }
    const ids = [...new Set([Number(old.book_id), Number(book_id)])].sort((a, b) => a - b);
    const locked = await client.query('SELECT * FROM books WHERE id=ANY($1::int[]) ORDER BY id FOR UPDATE', [ids]);
    if (locked.rows.length !== ids.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Book not found' }); }
    const books = new Map(locked.rows.map((b) => [Number(b.id), b]));
    let userName = null;
    if (user_id) {
      const u = await client.query('SELECT name FROM users WHERE id=$1', [user_id]);
      if (!u.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'User not found' }); }
      userName = u.rows[0].name;
    }
    const changes = new Map();
    changes.set(Number(old.book_id), -effect(old.type, old.quantity));
    changes.set(Number(book_id), (changes.get(Number(book_id)) || 0) + effect(type, qty));
    for (const [id, delta] of changes) {
      if (books.get(id).quantity + delta < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `The change would make stock for "${books.get(id).title}" negative.` });
      }
    }
    for (const [id, delta] of changes) await client.query('UPDATE books SET quantity=quantity+$1 WHERE id=$2', [delta, id]);
    const target = books.get(Number(book_id));
    const updated = await client.query(
      `UPDATE transactions SET book_id=$1, book_title=$2, user_id=$3, user_name=$4, type=$5, quantity=$6
       WHERE id=$7 RETURNING *`,
      [book_id, target.title, user_id || null, userName, type, qty, req.params.id]
    );
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); next(e); }
  finally { client.release(); }
});

// DELETE: undo the stock movement before removing the history record.
router.delete('/:id', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const oldRes = await client.query('SELECT * FROM transactions WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!oldRes.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Transaction not found' }); }
    const old = oldRes.rows[0];
    if (old.book_id) {
      const bookRes = await client.query('SELECT * FROM books WHERE id=$1 FOR UPDATE', [old.book_id]);
      if (bookRes.rows.length) {
        const nextQuantity = bookRes.rows[0].quantity - effect(old.type, old.quantity);
        if (nextQuantity < 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'This transaction cannot be deleted because later stock activity depends on it.' });
        }
        await client.query('UPDATE books SET quantity=$1 WHERE id=$2', [nextQuantity, old.book_id]);
      }
    }
    await client.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Transaction deleted and stock adjusted.' });
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); next(e); }
  finally { client.release(); }
});

module.exports = router;
