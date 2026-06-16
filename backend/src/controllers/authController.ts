import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiresAt,
} from "../utils/tokens";

const saltRounds = 10;

// Register User controller. creates user. Required parameters: name, email, password.
export const register = asyncHandler(async (req, res, next) => {
  const userInfo = req.body;

  // checks types of user info
  if (
    typeof userInfo.name !== "string" ||
    typeof userInfo.email !== "string" ||
    typeof userInfo.password !== "string"
  ) {
    return next(
      new ErrorResponse("Name, email, and password are required", 400),
    );
  }

  // validates email
  const email = userInfo.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return next(new ErrorResponse("Invalid email", 400));
  }

  // validates name
  const rawName = userInfo.name.trim();

  if (!rawName) {
    return next(new ErrorResponse("Name is required", 400));
  }

  const nameParts = rawName.split(/\s+/);

  if (nameParts.length < 2) {
    return next(
      new ErrorResponse("Name must include first and last name", 400),
    );
  }

  if (nameParts.length > 3) {
    return next(
      new ErrorResponse(
        "Name can include at most first, middle, and last name",
        400,
      ),
    );
  }

  for (const part of nameParts) {
    if (!/^[A-Za-z]+$/.test(part)) {
      return next(new ErrorResponse("Name can only contain letters", 400));
    }

    if (part.length < 2) {
      return next(
        new ErrorResponse("Each name must be at least 2 characters", 400),
      );
    }

    if (part.length > 30) {
      return next(
        new ErrorResponse("Each name must be 30 characters or less", 400),
      );
    }
  }

  const name = nameParts.join(" ");

  // validates and encrypts password
  const password = userInfo.password;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

  if (!passwordRegex.test(password)) {
    return next(new ErrorResponse("Please create a stronger password", 400));
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
    message: "User registered successfully",
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
  if (typeof email !== "string" || typeof password !== "string") {
    return next(
      new ErrorResponse("Valid email and password are required", 400),
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  // checks if email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail) || password.length < 1) {
    return next(
      new ErrorResponse("Valid email and password are required", 400),
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
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // check password
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return next(new ErrorResponse("Invalid email or password", 401));
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
    message: "Logged in successfully",
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

  if (typeof refreshToken !== "string" || refreshToken.trim().length === 0) {
    return next(new ErrorResponse("Refresh token is required", 400));
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
    message: "Logged out successfully",
  });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (typeof refreshToken !== "string" || refreshToken.trim().length === 0) {
    return next(new ErrorResponse("Refresh token is required", 400));
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
    return next(new ErrorResponse("Invalid refresh token", 401));
  }

  if (storedToken.revokedAt) {
    return next(new ErrorResponse("Refresh token has been revoked", 401));
  }

  if (storedToken.expiresAt < new Date()) {
    return next(new ErrorResponse("Refresh token has expired", 401));
  }

  const token = createAccessToken(storedToken.userId);

  return res.status(200).json({
    message: "Access token refreshed successfully",
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
    return next(new ErrorResponse("Unauthorized access", 401));
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
