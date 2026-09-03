import { Router } from "express";
import { getAllUsers } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  getAllUsers
);

export default router;