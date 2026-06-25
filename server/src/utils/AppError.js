/**
 * Custom error class for predictable, operational errors (bad input,
 * unauthorized, not found, etc.) — as opposed to unexpected bugs.
 * Lets middleware distinguish "expected failure, safe to show message"
 * from "unexpected crash, hide details from the client."
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
