const express = require('express');
const pool = require('../db/pool');
const router = express.Router();
const { authenticate, allowRoles } = require('../middleware/auth');

function validate(b, partial = false) {
  const errors = [];
  for (const f of ['title', 'author', 'genre', 'isbn']) {
    if (!partial || b[f] !== undefined) {
      if (typeof b[f] !== 'string' || !b[f].trim()) errors.push(`${f} is required`);
    }
  }
  if (!partial || b.quantity !== undefined) {
    const q = Number(b.quantity);
    if (!Number.isInteger(q) || q < 0) errors.push('quantity must be a whole number (0 or more)');
  }
  return errors;
}

// READ all (optional ?search=)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const { rows } = search
      ? await pool.query(
          `SELECT * FROM books
           WHERE title ILIKE $1 OR author ILIKE $1 OR genre ILIKE $1 OR isbn ILIKE $1
           ORDER BY title`, [`%${search}%`])
      : await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (e) { next(e); }
});

// READ one
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// CREATE
router.post('/', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const { title, author, genre, isbn, quantity } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO books (title, author, genre, isbn, quantity)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// UPDATE
router.put('/:id', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const { title, author, genre, isbn, quantity } = req.body;
    const { rows } = await pool.query(
      `UPDATE books SET title=$1, author=$2, genre=$3, isbn=$4, quantity=$5
       WHERE id=$6 RETURNING *`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// DELETE
router.delete('/:id', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
