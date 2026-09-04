import { Router } from "express";

import {
  getMockOtps,
  getMockEmailsEndpoint,
} from "../controllers/dev.controller.js";

const router = Router();

router.get("/otps", getMockOtps);
router.get("/emails", getMockEmailsEndpoint);

export default router;