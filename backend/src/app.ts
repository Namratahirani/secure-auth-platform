import dotenv from "dotenv";
import path from "path";

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
    origin: ["http://localhost:5173", "http://localhost:5174"],
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

export default app;