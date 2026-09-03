import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_2FA_SECRET = process.env.JWT_2FA_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!JWT_2FA_SECRET) {
  throw new Error("JWT_2FA_SECRET is not defined");
}

interface AccessTokenPayload {
  userId: string;
  role: string;
}

/**
 * Generates a short-lived JWT access token.
 * Access tokens are intentionally short-lived to reduce
 * the impact of token theft.
 */
export const generateAccessToken = (
  payload: AccessTokenPayload
) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Generates a cryptographically secure refresh token.
 * Only the SHA-256 hash is stored in the database.
 */
export const generateRefreshToken = async (
  userId: string
) => {
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return refreshToken;
};

/**
 * Validates a refresh token and rotates it.
 *
 * The existing refresh token is revoked and a new
 * access + refresh token pair is generated.
 */
export const refreshAccessToken = async (
  refreshToken: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revoked) {
    throw new Error("Refresh token has been revoked");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token has expired");
  }

  if (!storedToken.user.isActive) {
    throw new Error("User account is inactive");
  }

  // Revoke the old refresh token.
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revoked: true,
    },
  });

  // Generate a new access token.
  const newAccessToken = generateAccessToken({
    userId: storedToken.user.id,
    role: storedToken.user.role,
  });

  // Generate a new refresh token.
  const newRefreshToken = await generateRefreshToken(
    storedToken.user.id
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Revokes a refresh token during logout.
 */
export const revokeRefreshToken = async (
  refreshToken: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revoked) {
    throw new Error("Refresh token has already been revoked");
  }

  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revoked: true,
    },
  });
};

/**
 * Generates a short-lived temporary token used
 * only during the 2FA login flow.
 */
export const generateTwoFactorToken = (
  userId: string
) => {
  return jwt.sign(
    {
      userId,
      purpose: "2FA_LOGIN",
    },
    JWT_2FA_SECRET,
    {
      expiresIn: "5m",
    }
  );
};