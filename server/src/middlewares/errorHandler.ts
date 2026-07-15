import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If headers already sent, hand over to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle Zod ValidationError
  if (err instanceof ZodError || err.name === "ZodError") {
    const issues = err.issues || err.errors || [];
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: Array.isArray(issues)
          ? issues.map((e: any) => ({
              field: e.path ? e.path.join(".") : "",
              message: e.message || "Invalid value",
            }))
          : [],
      },
    });
    return;
  }

  // Handle DB Unique Constraint errors
  if (err.code === "23505") {
    res.status(409).json({
      success: false,
      error: {
        message: "Resource already exists",
        details: err.detail,
      },
    });
    return;
  }

  // Generic System Errors
  console.error("Unhandle Error:", err);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error: " + (err.message || String(err)),
      stack: err.stack,
    },
  });
}
