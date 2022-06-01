module.exports = (err, _, res, next) => {
  if (!err) {
    return next();
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  return res
    .status(err.code)
    .json(err.errors.length ? { errors: err.errors } : { error: err.message });
};
