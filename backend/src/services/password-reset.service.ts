import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

export const createPasswordResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  
  if (!user) {
    return;
  }

  // Generate a secure random token
 const resetToken = crypto.randomBytes(32).toString("hex");

const tokenHash = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");

const expiresAt = new Date(Date.now() + 60 * 60 * 1000);


await prisma.passwordReset.updateMany({
  where: {
    userId: user.id,
    used: false,
  },
  data: {
    used: true,
  },
});

// Create the new password reset token
await prisma.passwordReset.create({
  data: {
    userId: user.id,
    tokenHash,
    expiresAt,
  },
});


  const resetLink =
    `http://localhost:5173/reset-password?token=${resetToken}`;

  console.log("=================================");
  console.log("PASSWORD RESET LINK:");
  console.log(resetLink);
  console.log("=================================");

  return resetToken;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetRecord = await prisma.passwordReset.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!resetRecord) {
    throw new Error("Invalid password reset token");
  }

  if (resetRecord.used) {
    throw new Error("Password reset token has already been used");
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new Error("Password reset token has expired");
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    12
  );
await prisma.user.update({
  where: {
    id: resetRecord.userId,
  },
  data: {
    passwordHash,
  },
});


await prisma.refreshToken.updateMany({
  where: {
    userId: resetRecord.userId,
    revoked: false,
  },
  data: {
    revoked: true,
  },
});


await prisma.passwordReset.update({
    where: {
      id: resetRecord.id,
    },
    data: {
      used: true,
    },
  });

  return true;
};