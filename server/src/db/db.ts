import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config/config";

export const connection = postgres(config.DATABASE_URL);

export const db = drizzle(connection);
