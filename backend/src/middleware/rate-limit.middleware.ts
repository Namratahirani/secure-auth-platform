import rateLimit from "express-rate-limit";

/*
 * LOGIN
 *
 * Protect against password brute-force attacks.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many login attempts. Please try again later.",
  },
});

/*
 * REGISTRATION
 *
 * Prevent automated account creation.
 */
export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many registration attempts. Please try again later.",
  },
});

/*
 * OTP
 *
 * Protect OTP verification and generation.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many OTP attempts. Please try again later.",
  },
});

/*
 * REFRESH TOKEN
 *
 * Prevent excessive token refresh requests.
 */
export const refreshTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many refresh requests. Please try again later.",
  },
});

/*
 * FORGOT PASSWORD
 *
 * Also helps prevent email/OTP abuse.
 */
export const forgotPasswordRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message:
        "Too many password reset requests. Please try again later.",
    },
  });

/*
 * RESET PASSWORD
 */
export const resetPasswordRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message:
        "Too many password reset attempts. Please try again later.",
    },
  });