import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { AppError } from "./errorHandler";

export interface UserPayload {
  id: string;
  email: string;
  role: "admin" | "committee" | "resident";
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401, { code: "TOKEN_EXPIRED" }));
    }
    next(new AppError("Invalid access token", 401));
  }
}

export function requireRoles(roles: ("admin" | "committee" | "resident")[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
}
