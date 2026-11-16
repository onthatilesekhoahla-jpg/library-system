// Central error handling so routes can simply `next(err)`.
function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Postgres error codes
  if (err.code === '23505') return res.status(409).json({ error: 'A record with that unique value already exists.' });
  if (err.code === '23514') return res.status(400).json({ error: 'Value violates a database constraint.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { notFound, errorHandler };
