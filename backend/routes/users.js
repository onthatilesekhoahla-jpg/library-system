const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const router = express.Router();
const { createToken, authenticate, allowRoles } = require('../middleware/auth');

const ROLES = ['admin', 'librarian', 'member'];
const COLUMNS = 'id, name, membership_id, role, created_at'; // never expose password_hash

function validate(u, { requirePassword }) {
  const errors = [];
  if (!u.name || !String(u.name).trim()) errors.push('name is required');
  if (!u.membership_id || !String(u.membership_id).trim()) errors.push('membership_id is required');
  if (!ROLES.includes(u.role)) errors.push(`role must be one of: ${ROLES.join(', ')}`);
  if (requirePassword && (!u.password || String(u.password).length < 6)) errors.push('password must be at least 6 characters');
  if (!requirePassword && u.password && String(u.password).length < 6) errors.push('password must be at least 6 characters');
  return errors;
}

// LOGIN  (POST /users/login)
router.post('/login', async (req, res, next) => {
  try {
    const { membership_id, password } = req.body;
    if (!membership_id || !password) return res.status(400).json({ error: 'Membership ID and password are required' });
    const { rows } = await pool.query('SELECT * FROM users WHERE membership_id = $1', [String(membership_id).trim()]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid membership ID or password' });
    }
    const { password_hash, ...safe } = user; // eslint-disable-line no-unused-vars
    res.json({ user: safe, token: createToken(safe) });
  } catch (e) { next(e); }
});

router.get('/', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM users ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, allowRoles('admin', 'librarian'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM users WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.post('/', authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    const errors = validate(req.body, { requirePassword: true });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const { name, membership_id, role, password } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO users (name, membership_id, role, password_hash)
       VALUES ($1,$2,$3,$4) RETURNING ${COLUMNS}`,
      [name.trim(), membership_id.trim(), role, bcrypt.hashSync(password, 10)]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// UPDATE (password optional: only changed when supplied)
router.put('/:id', authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    const errors = validate(req.body, { requirePassword: false });
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    const { name, membership_id, role, password } = req.body;
    const params = [name.trim(), membership_id.trim(), role];
    let sql = 'UPDATE users SET name=$1, membership_id=$2, role=$3';
    if (password) { params.push(bcrypt.hashSync(password, 10)); sql += `, password_hash=$${params.length}`; }
    params.push(req.params.id);
    sql += ` WHERE id=$${params.length} RETURNING ${COLUMNS}`;
    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
