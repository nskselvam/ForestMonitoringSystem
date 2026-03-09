import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For this project, since it is a mock analytical engine currently, 
// we will fallback to a local in-memory DB or skip using the DB if no DATABASE_URL is set.
// But we still set it up for best practices.

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
