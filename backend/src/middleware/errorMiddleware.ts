import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../errors/ErrorResponse';
import { Prisma } from '../generated/prisma/client';

// Middleware for errors.
// If you pass an error or custom ErrorResponse object into next(),
// this middleware catches it and sends the response.
export default function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Custom app errors
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Invalid JWT
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  // Expired JWT
  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Prisma duplicate unique field error
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return res
      .status(409)
      .json({ error: 'Duplicate email, please choose a new email.' });
  }

  // Unexpected errors are logged for debugging.
  if (err instanceof Error) {
    console.error(err);
  }

  return res.status(500).json({ error: 'Something went wrong' });
}
