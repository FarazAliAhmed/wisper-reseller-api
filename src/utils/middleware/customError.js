class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode || 500;
  }
}

// General error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Check if the error is a known error type
  if (err instanceof CustomError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, statusCode: err.statusCode });
  }

  // Handle other types of errors
  res.status(500).json({ error: err.message, statusCode: 500 });
};

module.exports = { errorHandler, CustomError };
