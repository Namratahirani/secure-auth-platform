import { Request, Response } from "express";

import {
  loginUser,
  registerUser,
} from "../services/auth.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
  generateTwoFactorToken,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/token.service.js";

import {
  generateAndSendOtp,
} from "../services/otp.service.js";

import { createAuditLog } from "../services/audit.service.js";


const getAuditContext = (req: Request) => ({
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
});


export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await registerUser({
      email,
      password,
      phone,
    });

    await createAuditLog({
      userId: user.id,
      action: "REGISTER_SUCCESS",
      ...getAuditContext(req),
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    let user;

    try {
      user = await loginUser(email, password);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid email or password"
      ) {
        await createAuditLog({
          action: "LOGIN_FAILED",
          ...getAuditContext(req),
        });

        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      throw error;
    }

    if (user.is2FAEnabled) {
      if (!user.phone) {
        return res.status(400).json({
          message: "Phone number is required for 2FA",
        });
      }

      await generateAndSendOtp(
        user.id,
        user.phone,
        "LOGIN_2FA"
      );

      const twoFactorToken = generateTwoFactorToken(
        user.id
      );

      await createAuditLog({
        userId: user.id,
        action: "LOGIN_2FA_REQUIRED",
        ...getAuditContext(req),
      });

      return res.status(200).json({
        message: "OTP required",
        requires2FA: true,
        twoFactorToken,
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
      action: "LOGIN_SUCCESS",
      ...getAuditContext(req),
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      requires2FA: false,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const refreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const tokens = await refreshAccessToken(
      refreshToken
    );

    await createAuditLog({
      action: "TOKEN_REFRESH",
      ...getAuditContext(req),
    });

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

  } catch (error) {
    if (error instanceof Error) {
      if (
  error.message === "Invalid refresh token" ||
  error.message === "Refresh token has been revoked" ||
  error.message === "Refresh token has expired" ||
  error.message === "Refresh token reuse detected"
) {
        return res.status(401).json({
          message: error.message,
        });
      }

      if (
        error.message === "User account is inactive"
      ) {
        return res.status(403).json({
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


export const logout = async (
  req: Request,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    await revokeRefreshToken(refreshToken);

    await createAuditLog({
      action: "LOGOUT",
      ...getAuditContext(req),
    });

    return res.status(200).json({
      message: "Logout successful",
    });

  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid refresh token" ||
        error.message === "Refresh token has already been revoked"
      ) {
        return res.status(401).json({
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