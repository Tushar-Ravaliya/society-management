import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

if (!process.env.PORT) {
  throw new Error("PORT is not defined");
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_123";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_543";

export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
};
