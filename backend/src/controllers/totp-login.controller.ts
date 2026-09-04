import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

import { verifyTotp } from "../services/totp.service.js";

import { createAuditLog } from "../services/audit.service.js";

const JWT_2FA_SECRET = process.env.JWT_2FA_SECRET;

if (!JWT_2FA_SECRET) {
  throw new Error("JWT_2FA_SECRET is not defined");
}

export const verifyLoginTotp = async (
  req: Request,
  res: Response
) => {
  try {
    const { twoFactorToken, token } = req.body;

    if (!twoFactorToken || !token) {
      return res.status(400).json({
        message: "Two-factor token and TOTP code are required",
      });
    }

    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({
        message: "TOTP code must be a 6-digit number",
      });
    }

    const decoded = jwt.verify(
      twoFactorToken,
      JWT_2FA_SECRET
    ) as {
      userId: string;
      purpose: string;
    };

    if (
      !decoded ||
      decoded.purpose !== "2FA_LOGIN"
    ) {
      return res.status(401).json({
        message: "Invalid 2FA token",
      });
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "User account is inactive or does not exist",
      });
    }

    if (!user.isTotpEnabled || !user.totpSecret) {
      return res.status(400).json({
        message: "TOTP is not enabled for this account",
      });
    }

    await verifyTotp(userId, token);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken(
      user.id,
      req.get("user-agent"),
      req.ip
    );

    await createAuditLog({
      userId: user.id,
      action: "TOTP_LOGIN_SUCCESS",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "TOTP verification successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
        isTotpEnabled: user.isTotpEnabled,
      },
    });

  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Invalid TOTP"
    ) {
      return res.status(401).json({
        message: "Invalid TOTP code",
      });
    }

    return res.status(401).json({
      message: "Invalid or expired 2FA token",
    });
  }
};