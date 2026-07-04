import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 1. Log the error internally
  if (err.statusCode >= 500) {
    logger.error(`Unhandled system error: ${err.message}\nStack: ${err.stack}`);
  } else {
    logger.warn(`Operational Warning: ${err.message}`);
  }

  // 2. Translate MongoDB/Mongoose specific errors
  let errorResponse = {
    status: err.status,
    message: err.message
  };

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    err.statusCode = 409;
    errorResponse.status = 'fail';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    errorResponse.message = `Duplicate field value entered. A record with this ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    errorResponse.status = 'fail';
    const messages = Object.values(err.errors).map(el => el.message);
    errorResponse.message = `Invalid input data: ${messages.join(', ')}`;
  }

  // CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    errorResponse.status = 'fail';
    errorResponse.message = `Invalid format for field ${err.path}: ${err.value}.`;
  }

  // JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    errorResponse.status = 'fail';
    errorResponse.message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    errorResponse.status = 'fail';
    errorResponse.message = 'Your login session has expired. Please log in again.';
  }

  // 3. Return response to the client
  res.status(err.statusCode).json(errorResponse);
}

export default errorHandler;
