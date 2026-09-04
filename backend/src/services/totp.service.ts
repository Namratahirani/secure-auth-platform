import speakeasy from "speakeasy";
import prisma from "../config/prisma.js";

export const setupTotp = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const generated = speakeasy.generateSecret({
    name: `Sstudize SecureAuth:${user.email}`,
    issuer: "Sstudize SecureAuth",
    length: 20,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret: generated.base32,
    },
  });

  return {
    secret: generated.base32,
    uri: generated.otpauth_url,
  };
};

export const verifyTotp = async (
  userId: string,
  token: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.totpSecret) {
    throw new Error("TOTP is not configured");
  }

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid TOTP");
  }

  return true;
};

export const enableTotp = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isTotpEnabled: true,
    },
  });
};