class CustomError extends Error {
  constructor(code, message) {
    super(typeof message === 'string' ? message : '');
    this.errors = [];
    if (typeof message !== 'string') {
      this.errors = message;
    }
    this.code = code;
    this.name = 'HttpError';
  }
}

module.exports = CustomError;