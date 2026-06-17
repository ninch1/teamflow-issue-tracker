import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiresAt,
} from '../utils/tokens';

const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getNameValidationError(rawName: string): string | null {
  const trimmedName = rawName.trim();

  if (!trimmedName) {
    return 'Name is required';
  }

  const nameParts = trimmedName.split(/\s+/);

  if (nameParts.length < 2) {
    return 'Name must include first and last name';
  }

  if (nameParts.length > 3) {
    return 'Name can include at most first, middle, and last name';
  }

  for (const part of nameParts) {
    if (!/^[A-Za-z]+$/.test(part)) {
      return 'Name can only contain letters';
    }

    if (part.length < 2) {
      return 'Each name must be at least 2 characters';
    }

    if (part.length > 30) {
      return 'Each name must be 30 characters or less';
    }
  }

  return null;
}

function normalizeUserName(rawName: string): string {
  return rawName.trim().split(/\s+/).join(' ');
}

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
  const email = userInfo.email.trim().toLowerCase();

  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Invalid email', 400));
  }

  // validates name
  const nameError = getNameValidationError(userInfo.name);

  if (nameError) {
    return next(new ErrorResponse(nameError, 400));
  }

  const name = normalizeUserName(userInfo.name);

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

  const token = createAccessToken(user.id);
  const refreshToken = createRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// Login User controller. logs in user. Required parameters: email, password.
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are strings before processing them
  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(
      new ErrorResponse('Valid email and password are required', 400),
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  // checks if email is valid
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

  const token = createAccessToken(user.id);
  const refreshToken = createRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  // login and return tokens
  return res.status(200).json({
    message: 'Logged in successfully',
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    return next(new ErrorResponse('Refresh token is required', 400));
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    return next(new ErrorResponse('Refresh token is required', 400));
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!storedToken) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }

  if (storedToken.revokedAt) {
    return next(new ErrorResponse('Refresh token has been revoked', 401));
  }

  if (storedToken.expiresAt < new Date()) {
    return next(new ErrorResponse('Refresh token has expired', 401));
  }

  const token = createAccessToken(storedToken.userId);

  return res.status(200).json({
    message: 'Access token refreshed successfully',
    token,
    user: storedToken.user,
  });
});

// Protected controller. gets user info.
export const me = asyncHandler(async (req, res, next) => {
  // gets user from authMiddleware
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // returns user data
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

export const updateMe = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { name, email } = req.body;

  const updateData: {
    name?: string;
    email?: string;
  } = {};

  if (name !== undefined) {
    if (typeof name !== 'string') {
      return next(new ErrorResponse('Name is required', 400));
    }

    const nameError = getNameValidationError(name);

    if (nameError) {
      return next(new ErrorResponse(nameError, 400));
    }

    updateData.name = normalizeUserName(name);
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      return next(new ErrorResponse('Email is required', 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return next(new ErrorResponse('Invalid email', 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      return next(new ErrorResponse('Email is already in use', 409));
    }

    updateData.email = normalizedEmail;
  }

  if (!updateData.name && !updateData.email) {
    return next(new ErrorResponse('No profile changes provided', 400));
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return res.status(200).json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { currentPassword, newPassword } = req.body;

  if (
    typeof currentPassword !== 'string' ||
    currentPassword.trim().length === 0
  ) {
    return next(new ErrorResponse('Current password is required', 400));
  }

  if (typeof newPassword !== 'string') {
    return next(new ErrorResponse('New password is required', 400));
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

  if (!passwordRegex.test(newPassword)) {
    return next(new ErrorResponse('Please create a stronger password', 400));
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    existingUser.passwordHash,
  );

  if (!isPasswordValid) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
      },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  return res.status(200).json({
    message: 'Password updated successfully',
  });
});
