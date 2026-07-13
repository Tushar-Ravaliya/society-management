import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

if (!process.env.PORT) {
  throw new Error("PORT is not defined");
}

export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
};
