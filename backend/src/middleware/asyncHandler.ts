import { RequestHandler } from 'express';

// Wraps async route handlers so thrown errors are passed to Express error middleware.
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
