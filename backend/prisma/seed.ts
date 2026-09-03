import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const main = async () => {
  // -------------------------
  // Demo USER
  // -------------------------

  const userPasswordHash = await bcrypt.hash(
    "TestPassword123!",
    12
  );

  const user = await prisma.user.upsert({
    where: {
      email: "demo@secureauth.com",
    },
    update: {},
    create: {
      email: "demo@secureauth.com",
      passwordHash: userPasswordHash,
      phone: "+919876543210",
      role: "USER",
      isActive: true,
      is2FAEnabled: false,
    },
  });

  // -------------------------
  // Demo ADMIN
  // -------------------------

  const adminPasswordHash = await bcrypt.hash(
    "AdminPassword123!",
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@secureauth.com",
    },
    update: {},
    create: {
      email: "admin@secureauth.com",
      passwordHash: adminPasswordHash,
      phone: "+919876543211",
      role: "ADMIN",
      isActive: true,
      is2FAEnabled: false,
    },
  });

  console.log("Seed users created:");

  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });