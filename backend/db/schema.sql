-- Library Management System schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30)  NOT NULL UNIQUE,
  role          VARCHAR(20)  NOT NULL DEFAULT 'member' CHECK (role IN ('admin','librarian','member')),
  password_hash VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(150) NOT NULL,
  genre      VARCHAR(80)  NOT NULL,
  isbn       VARCHAR(20)  NOT NULL UNIQUE,
  quantity   INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  book_id    INTEGER REFERENCES books(id) ON DELETE SET NULL,
  book_title VARCHAR(200) NOT NULL,           -- kept so history survives book deletion
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name  VARCHAR(100),
  type       VARCHAR(10) NOT NULL CHECK (type IN ('add','borrow')),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
