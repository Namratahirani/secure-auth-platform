import { Request, Response } from "express";

import {
  createPasswordResetToken,
  resetPassword,
} from "../services/password-reset.service.js";

import { createAuditLog } from "../services/audit.service.js";


export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    await createPasswordResetToken(email);

    await createAuditLog({
      action: "PASSWORD_RESET_REQUESTED",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Same response whether user exists or not
    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been generated.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    await resetPassword(token, newPassword);

    await createAuditLog({
      action: "PASSWORD_RESET_SUCCESS",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid password reset token" ||
        error.message === "Password reset token has already been used" ||
        error.message === "Password reset token has expired"
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