import { Request, Response, NextFunction } from "express";

export const devAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const configuredSecret = process.env.DEV_ENDPOINT_SECRET;
  const providedSecret = req.header("x-dev-endpoint-secret");

  if (!configuredSecret) {
    return res.status(503).json({
      message: "Developer endpoints are not configured.",
    });
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  next();
};