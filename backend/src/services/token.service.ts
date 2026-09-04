import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { createAuditLog } from "./audit.service.js";

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

/*
 * Short-lived JWT access token.
 */
export const generateAccessToken = (
  payload: AccessTokenPayload
) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

/*
 * Generate and store a hashed refresh token.
 *
 * The raw refresh token is returned to the client.
 * Only its SHA-256 hash is stored in PostgreSQL.
 */
export const generateRefreshToken = async (
  userId: string,
  deviceInfo?: string,
  ipAddress?: string
) => {
  const refreshToken = crypto
    .randomBytes(64)
    .toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      deviceInfo,
      ipAddress,
    },
  });

  return refreshToken;
};

/*
 * Refresh-token rotation.
 *
 * Every successful refresh:
 * 1. Old token is revoked.
 * 2. New refresh token is created.
 * 3. Old token points to replacement.
 *
 * Reusing an already-rotated token is detected.
 */
export const refreshAccessToken = async (
  refreshToken: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken =
    await prisma.refreshToken.findUnique({
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

  /*
   * If a revoked token has replacedByTokenId,
   * it means this token was already rotated.
   *
   * Presenting it again = token reuse.
   */
  if (storedToken.revoked) {
  if (storedToken.replacedByTokenId) {
    await createAuditLog({
      userId: storedToken.userId,
      action: "REFRESH_TOKEN_REUSE_DETECTED",
      ipAddress: storedToken.ipAddress ?? undefined,
    });
  }

  throw new Error(
    "Refresh token has been revoked"
  );
}

  if (storedToken.expiresAt < new Date()) {
    throw new Error(
      "Refresh token has expired"
    );
  }

  if (!storedToken.user.isActive) {
    throw new Error(
      "User account is inactive"
    );
  }

  /*
   * Generate replacement refresh token.
   */
  const newRefreshToken = crypto
    .randomBytes(64)
    .toString("hex");

  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const newExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  const newStoredToken =
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,

        /*
         * Preserve device information.
         */
        deviceInfo: storedToken.deviceInfo,

        /*
         * Store the IP associated with the
         * new refresh-token generation.
         */
        ipAddress: storedToken.ipAddress,
      },
    });

  /*
   * Revoke old refresh token and link it
   * to the replacement.
   */
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revoked: true,
      replacedByTokenId: newStoredToken.id,
    },
  });

  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    role: storedToken.user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

/*
 * Logout / explicit refresh-token revocation.
 */
export const revokeRefreshToken = async (
  refreshToken: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken =
    await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revoked) {
    throw new Error(
      "Refresh token has already been revoked"
    );
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

/*
 * Temporary JWT used during 2FA login.
 *
 * It is NOT the normal access token.
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