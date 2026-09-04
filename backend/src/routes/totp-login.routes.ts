import { Router } from "express";

import {
  verifyLoginTotp,
} from "../controllers/totp-login.controller.js";

import {
  otpRateLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/verify",
  otpRateLimiter,
  verifyLoginTotp
);

export default router;