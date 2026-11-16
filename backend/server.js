require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());          // allow the React dev server (different origin)
app.use(express.json());  // parse JSON request bodies

app.get('/', (req, res) => res.json({ message: 'Library Management API is running' }));
app.use('/books', require('./routes/books'));
app.use('/transactions', require('./routes/transactions'));
app.use('/users', require('./routes/users'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}
module.exports = app;
