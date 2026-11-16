// Creates tables and seeds demo data.  Run with:  npm run init-db
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./pool');

(async () => {
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
    if (rows[0].n === 0) {
      const hash = (p) => bcrypt.hashSync(p, 10);
      await pool.query(
        `INSERT INTO users (name, membership_id, role, password_hash) VALUES
         ('System Admin',   'ADMIN001', 'admin',     $1),
         ('Lerato Mokoena', 'LIB001',   'librarian', $2),
         ('Thabo Molefe',   'MEM001',   'member',    $3)`,
        [hash('admin123'), hash('librarian123'), hash('member123')]
      );
      await pool.query(
        `INSERT INTO books (title, author, genre, isbn, quantity) VALUES
         ('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 6),
         ('Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1),
         ('Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 4),
         ('Mhudi', 'Sol Plaatje', 'Fiction', '9780894106644', 0),
         ('The Pragmatic Programmer', 'Andrew Hunt', 'Technology', '9780135957059', 3)`
      );
      console.log('Seeded demo users and books.');
    }
    console.log('Database ready.');
  } catch (err) {
    console.error('DB init failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
