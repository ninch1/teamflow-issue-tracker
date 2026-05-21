import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../errors/ErrorResponse';
import { Prisma } from '../generated/prisma/client';

// Middleware for errors
// if you pass error or custom ErrorResponse object in next() this middleware will catch it
export default function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let error = 'Something went wrong';
  let statusCode = 500;

  if (err instanceof ErrorResponse) {
    error = err.message ? err.message : error;
    statusCode = err.statusCode ? err.statusCode : statusCode;
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    error = 'Duplicate email, please choose a new email.';
    statusCode = 409;
  } else if (err instanceof Error) {
    console.error(err);
  }

  res.status(statusCode).json({ error });
}
