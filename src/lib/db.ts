import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL is required in production.");
}

/** Server-only Neon SQL client. Never import this module into client components. */
export const sql = databaseUrl ? neon(databaseUrl) : null;
