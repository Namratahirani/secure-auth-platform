import { Router } from "express";

import { verifyLogin2FA } from "../controllers/twofa-login.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  login2FASchema,
} from "../validators/auth.validator.js";
import {
  otpRateLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/verify",
  otpRateLimiter,
  validate(login2FASchema),
  verifyLogin2FA
);

export default router;