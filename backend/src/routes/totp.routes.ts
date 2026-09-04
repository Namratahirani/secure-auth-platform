import { Router } from "express";

import {
  setupTotp,
  verifyTotp,
  enableTotp,
} from "../services/totp.service.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  otpRateLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

/*
 * POST /api/auth/totp/setup
 *
 * Starts authenticator setup.
 * Requires a valid access token.
 */
router.post(
  "/setup",
  authenticate,
  otpRateLimiter,
  async (req, res) => {
    try {
      const userId = req.user!.userId;

      const result = await setupTotp(userId);

      return res.status(200).json({
        message: "TOTP setup created",
        secret: result.secret,
        uri: result.uri,
      });
    } catch (error: any) {
      console.error("TOTP setup error:", error);

      return res.status(400).json({
        message:
          error.message ||
          "Unable to setup TOTP",
      });
    }
  }
);

/*
 * POST /api/auth/totp/verify
 *
 * Verifies the authenticator code and enables TOTP.
 * Requires a valid access token.
 */
router.post(
  "/verify",
  authenticate,
  otpRateLimiter,
  async (req, res) => {
    try {
      const userId = req.user!.userId;
      const { token } = req.body;

      // Validate that token exists
      if (!token) {
        return res.status(400).json({
          message: "TOTP code is required",
        });
      }

      // Validate six-digit TOTP
      if (!/^\d{6}$/.test(token)) {
        return res.status(400).json({
          message:
            "TOTP code must be a 6-digit number",
        });
      }

      // Verify code
      await verifyTotp(userId, token);

      // Enable TOTP only after successful verification
      await enableTotp(userId);

      return res.status(200).json({
        message: "TOTP enabled successfully",
      });
    } catch (error: any) {
      console.error(
        "TOTP verification error:",
        error
      );

      if (
        error instanceof Error &&
        error.message === "Invalid TOTP"
      ) {
        return res.status(401).json({
          message: "Invalid TOTP code",
        });
      }

      if (
        error instanceof Error &&
        error.message === "TOTP is not configured"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message:
          error.message ||
          "Unable to verify TOTP",
      });
    }
  }
);

export default router;