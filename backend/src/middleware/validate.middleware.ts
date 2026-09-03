import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Zod 4's generic type can be unknown,
    // so safely extract the validated body.
    const validatedData = result.data as {
      body: unknown;
    };

    req.body = validatedData.body;

    next();
  };
};