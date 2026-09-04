import { Router } from "express";

import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

import {
  loginRateLimiter,
  refreshTokenRateLimiter,
} from "../middleware/rate-limit.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  login
);

router.post(
  "/token/refresh",
  refreshTokenRateLimiter,
  validate(refreshTokenSchema),
  refreshToken
);

router.post(
  "/logout",
  validate(logoutSchema),
  logout
);

export default router;