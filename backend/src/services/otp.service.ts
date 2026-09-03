import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { sendOtpSms } from "../adapters/mock-sms.adapter.js";

export const generateAndSendOtp = async (
  userId: string,
  phone: string,
  purpose: string
) => {
  //GENERATE RANDOM OTP
  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

 
  const codeHash = await bcrypt.hash(otp, 10);

  
  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  
  await prisma.oTP.create({
    data: {
      userId,
      codeHash,
      purpose,
      expiresAt,
    },
  });

  // Send OTP through mock SMS
  await sendOtpSms(phone, otp);
};

export const verifyOtp = async (
  userId: string,
  otp: string,
  purpose: string
) => {
  const otpRecord = await prisma.oTP.findFirst({
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
    throw new Error("No valid OTP found");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  if (otpRecord.attempts >= 5) {
    throw new Error("Too many OTP attempts");
  }

  const isValid = await bcrypt.compare(
    otp,
    otpRecord.codeHash
  );

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

    throw new Error("Invalid OTP");
  }

  
  await prisma.oTP.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      used: true,
    },
  });


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