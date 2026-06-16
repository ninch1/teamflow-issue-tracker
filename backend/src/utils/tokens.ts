import crypto from "crypto";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

type JwtPayload = {
  userId: string;
};

export function createAccessToken(userId: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId } satisfies JwtPayload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function createRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export function getRefreshTokenExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
}
