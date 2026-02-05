import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? postgres(connectionString)
  : postgres("postgres://placeholder:placeholder@localhost:5432/placeholder");

export const db = drizzle(client, { schema });

export const isDatabaseConfigured = !!connectionString;
