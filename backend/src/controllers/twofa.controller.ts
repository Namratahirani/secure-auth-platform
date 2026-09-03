import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import prisma from "../config/prisma.js";

import {
  generateAndSendOtp,
  verifyOtp,
} from "../services/otp.service.js";

import { createAuditLog } from "../services/audit.service.js";


export const enable2FA = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        message: "Phone number is required to enable 2FA",
      });
    }

    if (user.is2FAEnabled) {
      return res.status(400).json({
        message: "2FA is already enabled",
      });
    }

    await generateAndSendOtp(
      user.id,
      user.phone,
      "ENABLE_2FA"
    );

    await createAuditLog({
      userId: user.id,
      action: "2FA_OTP_SENT",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const verify2FA = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "OTP must be a 6-digit number",
      });
    }

    await verifyOtp(
      userId,
      otp,
      "ENABLE_2FA"
    );

    await createAuditLog({
      userId,
      action: "2FA_ENABLED",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "2FA enabled successfully",
    });

  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "No valid OTP found" ||
        error.message === "OTP has expired" ||
        error.message === "Too many OTP attempts" ||
        error.message === "Invalid OTP"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};