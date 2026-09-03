import prisma from "../config/prisma.js";

interface AuditLogInput {
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async ({
  userId,
  action,
  ipAddress,
  userAgent,
}: AuditLogInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    
    console.error("Failed to create audit log:", error);
  }
};