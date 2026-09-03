import { Router } from "express";
import { getProfile } from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getProfile);

export default router;