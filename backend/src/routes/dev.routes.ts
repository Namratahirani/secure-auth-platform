import { Router } from "express";

import {
  getMockOtps,
  getMockEmailsEndpoint,
} from "../controllers/dev.controller.js";

import { devAuthMiddleware } from "../middleware/dev-auth.middleware.js";

const router = Router();

router.get("/otps", devAuthMiddleware, getMockOtps);
router.get("/emails", devAuthMiddleware, getMockEmailsEndpoint);

export default router;