const crypto = require('crypto');
const pool = require('../db/pool');

const SECRET = process.env.JWT_SECRET || 'development-only-change-this-secret';
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

function createToken(user) {
  const payload = encode({ id: user.id, exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(parts[0]).digest();
  let supplied;
  try { supplied = Buffer.from(parts[1], 'base64url'); } catch { return null; }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (!payload.id || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

async function authenticate(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Please sign in to continue.' });
  try {
    const { rows } = await pool.query('SELECT id, name, membership_id, role FROM users WHERE id=$1', [payload.id]);
    if (!rows.length) return res.status(401).json({ error: 'Your account is no longer available. Please sign in again.' });
    req.user = rows[0];
    next();
  } catch (error) { next(error); }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    next();
  };
}

module.exports = { createToken, authenticate, allowRoles };
