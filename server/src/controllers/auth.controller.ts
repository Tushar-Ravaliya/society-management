import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AppError } from "../middlewares/errorHandler";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptionsAccess = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const cookieOptionsRefresh = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  // POST /api/auth/register
  public static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password, name, phoneNumber, role } = req.body;
      const user = await AuthService.register({
        email,
        passwordText: password,
        name,
        phoneNumber,
        role: role || "resident",
      });

      res.status(201).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  public static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);

      const { accessToken, refreshToken } = AuthService.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      await AuthService.saveRefreshToken(user.id, refreshToken);

      res.cookie("accessToken", accessToken, cookieOptionsAccess);
      res.cookie("refreshToken", refreshToken, cookieOptionsRefresh);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  public static async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const oldRefreshToken = req.cookies?.refreshToken;
      if (!oldRefreshToken) {
        throw new AppError("Refresh token not found", 401);
      }

      const { accessToken, refreshToken, user } =
        await AuthService.rotateRefreshToken(oldRefreshToken);

      res.cookie("accessToken", accessToken, cookieOptionsAccess);
      res.cookie("refreshToken", refreshToken, cookieOptionsRefresh);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  public static async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        data: {
          message: "Logged out successfully",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  public static async me(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Not authenticated", 401);
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
