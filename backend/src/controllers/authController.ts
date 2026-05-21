import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

// Register User controller. creates user. Required parameters: name, email, password.
export const register = asyncHandler(async (req, res, next) => {
  const userInfo = req.body;

  // checks types of user info
  if (
    typeof userInfo.name !== 'string' ||
    typeof userInfo.email !== 'string' ||
    typeof userInfo.password !== 'string'
  ) {
    return next(
      new ErrorResponse('Name, email, and password are required', 400),
    );
  }

  // validates email
  const email = userInfo.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Invalid email', 400));
  }

  // validates name
  const name = userInfo.name.trim();
  const nameRegex = /^[A-Za-z]{2,30}( [A-Za-z]{2,30}){1,2}$/;
  if (!nameRegex.test(name)) {
    return next(
      new ErrorResponse(
        'Name must include first and last name using letters only',
        400,
      ),
    );
  }

  // validates and encrypts password
  const password = userInfo.password;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
  if (!passwordRegex.test(password)) {
    return next(new ErrorResponse('Please create a stronger password', 400));
  }
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Creates user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  return res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// Login User controller. logs in user. Required parameters: email, password, token.
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are strings before processing them
  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(
      new ErrorResponse('Valid email and password are required', 400),
    );
  }

  const trimmedEmail = email.trim();

  // checks if email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail) || password.length < 1) {
    return next(
      new ErrorResponse('Valid email and password are required', 400),
    );
  }

  // finds user
  const user = await prisma.user.findUnique({
    where: {
      email: trimmedEmail,
    },
  });

  // if user does not exist
  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // check password
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(new ErrorResponse('JWT secret is not configured', 500));
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: '1d',
  });

  // login and return token
  return res.status(200).json({
    message: 'Logged in successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// Protected controller. gets user info.
export const me = asyncHandler(async (req, res, next) => {
  // gets authorization headers
  const authHeader = req.headers.authorization;

  if (!authHeader) return next(new ErrorResponse('Not authorized', 401));

  // get token from headers
  let token;
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

  // returns user data
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});
