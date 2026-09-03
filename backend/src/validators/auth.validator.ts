import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    phone: z
      .string()
      .regex(
        /^\+?[1-9]\d{9,14}$/,
        "Invalid phone number"
      )
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required"),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, "Reset token is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "OTP must be a 6-digit number"
      ),
  }),
});

export const login2FASchema = z.object({
  body: z.object({
    twoFactorToken: z
      .string()
      .min(1, "Two-factor token is required"),

    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "OTP must be a 6-digit number"
      ),
  }),
});