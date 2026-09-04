import dotenv from "dotenv";
import path from "path";
import devRoutes from "./routes/dev.routes.js";
import totpRoutes from "./routes/totp.routes.js";
import totpLoginRoutes from "./routes/totp-login.routes.js";
import { devAuthMiddleware } from "./middleware/dev-auth.middleware.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import twofaRoutes from "./routes/twofa.routes.js";
import twofaLoginRoutes from "./routes/twofa-login.routes.js";
import passwordResetRoutes from "./routes/password-reset.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      ...(process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : []),
    ],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Secure Auth Platform API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth/2fa", twofaRoutes);
app.use("/api/auth/2fa-login", twofaLoginRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth/totp", totpRoutes);
app.use("/api/auth/totp-login", totpLoginRoutes);

if (process.env.ENABLE_DEV_ENDPOINTS === "true") {
  app.use("/api/dev", devAuthMiddleware, devRoutes);
}

export default app;