import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

/** Server-only Neon SQL client. Never import this module into client components. */
export const sql = databaseUrl ? neon(databaseUrl) : null;
