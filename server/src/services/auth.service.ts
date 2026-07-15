import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db/db";
import { users, refreshTokens } from "../db/schema";
import { config } from "../config/config";
import { AppError } from "../middlewares/errorHandler";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: "admin" | "committee" | "resident";
  status: "pending" | "active" | "inactive";
}

export class AuthService {
  // Registers a new user (admin can create users, or standard registration)
  public static async register(data: {
    email: string;
    passwordText: string;
    name: string;
    phoneNumber?: string;
    role: "admin" | "committee" | "resident";
  }): Promise<UserDTO> {
    // Check if email already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUsers.length > 0) {
      throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(data.passwordText, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        name: data.name,
        phoneNumber: data.phoneNumber || null,
        role: data.role,
        status: "active", // Defaulting to active for simple setup/testing
      })
      .returning();

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    };
  }

  // Authenticate user with credentials
  public static async login(email: string, passwordText: string): Promise<UserDTO> {
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userRecords.length === 0) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = userRecords[0];

    if (user.status !== "active") {
      throw new AppError("Your account is not active", 403);
    }

    const passwordMatches = await bcrypt.compare(passwordText, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  // Generate short-lived Access Token & long-lived Refresh Token
  public static generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  // Save Refresh Token to database
  public static async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
      isRevoked: false,
    });
  }

  // Handle Token Rotation (Refresh)
  public static async rotateRefreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDTO;
  }> {
    let payload: any;
    try {
      payload = jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Query active and unexpired token in database
    const tokenRecords = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenRecords.length === 0) {
      // Security breach mitigation: if token is presented but not found, check if it was previously revoked
      throw new AppError("Invalid or revoked refresh token", 401);
    }

    const tokenRecord = tokenRecords[0];

    // Mark old token as revoked/used
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    // Fetch user details
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenRecord.userId))
      .limit(1);

    if (userRecords.length === 0 || userRecords[0].status !== "active") {
      throw new AppError("User associated with this token is inactive or not found", 401);
    }

    const user = userRecords[0];

    // Generate new pair
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Save new refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  // Revoke/invalidate refresh token (on logout)
  public static async revokeRefreshToken(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, token));
  }

  // Get simplified list of all active residents (eligible for committee assignment)
  public static async getAllUsers() {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          eq(users.status, "active"),
          eq(users.role, "resident")
        )
      );
  }
}
