// generic JSON error responder
module.exports = (err, req, res, next) => {
  // Mongoose duplicate key error -> 409
  if (err && err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate key',
      details: err.keyValue
    });
  }
  // Mongoose validation errors -> 400
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      )
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};
