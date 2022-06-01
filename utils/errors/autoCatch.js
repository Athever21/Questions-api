module.exports = (f) => {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next)).catch(next);
  };
};