import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

import { verifyOtp } from "../services/otp.service.js";

import { createAuditLog } from "../services/audit.service.js";


const JWT_2FA_SECRET = process.env.JWT_2FA_SECRET;

if (!JWT_2FA_SECRET) {
  throw new Error("JWT_2FA_SECRET is not defined");
}


export const verifyLogin2FA = async (
  req: Request,
  res: Response
) => {
  try {
    const { twoFactorToken, otp } = req.body;

    if (!twoFactorToken || !otp) {
      return res.status(400).json({
        message: "Two-factor token and OTP are required",
      });
    }

   
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "OTP must be a 6-digit number",
      });
    }

    
    const decoded = jwt.verify(
      twoFactorToken,
      JWT_2FA_SECRET
    );

    
    if (
      typeof decoded !== "object" ||
      !decoded ||
      decoded.purpose !== "2FA_LOGIN"
    ) {
      return res.status(401).json({
        message: "Invalid 2FA token",
      });
    }

    const userId = decoded.userId as string;

   
    await verifyOtp(
      userId,
      otp,
      "LOGIN_2FA"
    );

   
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

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken(
      user.id
    );

    await createAuditLog({
      userId: user.id,
      action: "2FA_LOGIN_SUCCESS",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "2FA verification successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
      },
    });

  } catch (error) {

  
    if (error instanceof Error) {
      if (
        error.message === "Invalid OTP" ||
        error.message === "OTP has expired" ||
        error.message === "Too many OTP attempts" ||
        error.message === "No valid OTP found"
      ) {
        return res.status(401).json({
          message: error.message,
        });
      }
    }

    
    return res.status(401).json({
      message: "Invalid or expired 2FA token",
    });
  }
};