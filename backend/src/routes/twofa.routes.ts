import { Router } from "express";

import {
  enable2FA,
  verify2FA,
} from "../controllers/twofa.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { otpRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/enable",
  authenticate,
  otpRateLimiter,
  enable2FA
);

router.post(
  "/verify",
  authenticate,
  otpRateLimiter,
  verify2FA
);

export default router;