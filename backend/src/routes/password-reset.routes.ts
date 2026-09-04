import { Router } from "express";

import {
  forgotPassword,
  resetPasswordController,
} from "../controllers/password-reset.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} from "../middleware/rate-limit.middleware.js";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordController
);

export default router;