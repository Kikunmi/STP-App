const { validationResult } = require('express-validator');

/**
 * Validation error handler middleware
 * Checks for validation errors and returns formatted response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

module.exports = {
  handleValidationErrors
};
