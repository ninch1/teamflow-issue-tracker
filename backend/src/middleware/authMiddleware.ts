import asyncHandler from './asyncHandler';
import ErrorResponse from '../errors/ErrorResponse';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/auth';

// Middleware to protect routes

export default asyncHandler(async (req, res, next) => {
  // gets authorization headers
  const authHeader = req.headers.authorization;

  if (!authHeader) return next(new ErrorResponse('Not authorized', 401));

  // get token from headers
  let token: string | undefined;
  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

  if (!token) return next(new ErrorResponse('Not authorized', 401));

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret)
    return next(new ErrorResponse('JWT secret is not configured', 500));

  // verify token
  const decoded = jwt.verify(token, jwtSecret);

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string'
  ) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // gets user id
  const userId = decoded.userId;

  // finds user
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return next(new ErrorResponse('Unauthorized access', 401));

  // pass user to the protected route using custom req type
  const authReq = req as AuthRequest;
  authReq.user = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  next();
});
