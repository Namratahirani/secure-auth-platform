import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { sendOtpSms } from "../adapters/mock-sms.adapter.js";

export const generateAndSendOtp = async (
  userId: string,
  phone: string,
  purpose: string
) => {
  /*
   * Invalidate previous unused OTPs for
   * the same purpose.
   */
  await prisma.oTP.updateMany({
    where: {
      userId,
      purpose,
      used: false,
    },
    data: {
      used: true,
    },
  });

  /*
   * Generate cryptographically secure
   * six-digit OTP.
   */
  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

  /*
   * Never store the OTP itself.
   * Store only a bcrypt hash.
   */
  const codeHash = await bcrypt.hash(
    otp,
    10
  );

  /*
   * OTP expires after 5 minutes.
   */
  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await prisma.oTP.create({
    data: {
      userId,
      codeHash,
      purpose,
      expiresAt,
      attempts: 0,
      used: false,
    },
  });

  /*
   * Mock SMS adapter logs the OTP locally.
   */
  await sendOtpSms(phone, otp);
};

export const verifyOtp = async (
  userId: string,
  otp: string,
  purpose: string
) => {
  const otpRecord =
    await prisma.oTP.findFirst({
      where: {
        userId,
        purpose,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!otpRecord) {
    throw new Error(
      "No valid OTP found"
    );
  }

  /*
   * Check expiry.
   */
  if (
    otpRecord.expiresAt < new Date()
  ) {
    throw new Error(
      "OTP has expired"
    );
  }

  /*
   * Maximum 5 attempts.
   */
  if (otpRecord.attempts >= 5) {
    throw new Error(
      "Too many OTP attempts"
    );
  }

  const isValid =
    await bcrypt.compare(
      otp,
      otpRecord.codeHash
    );

  /*
   * Incorrect OTP:
   * increment attempt counter.
   */
  if (!isValid) {
    await prisma.oTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error(
      "Invalid OTP"
    );
  }

  /*
   * Correct OTP:
   * immediately mark as used.
   */
  await prisma.oTP.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      used: true,
    },
  });

  /*
   * Enable SMS 2FA only after
   * successful verification.
   */
  if (purpose === "ENABLE_2FA") {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        is2FAEnabled: true,
      },
    });
  }

  return true;
};