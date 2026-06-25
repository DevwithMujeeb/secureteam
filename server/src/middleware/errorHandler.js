/**
 * Centralized error handler. Operational errors (AppError instances) return
 * their intended message and status code. Anything else is treated as an
 * unexpected failure — logged, but the client only gets a generic message
 * so internal details are never leaked.
 */
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error("Unexpected error:", err);
  return res
    .status(500)
    .json({ message: "Something went wrong. Please try again later." });
};

module.exports = errorHandler;
