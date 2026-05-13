import { defineConfig } from "drizzle-kit";

// .env.local isn't auto-loaded by drizzle-kit — load it explicitly
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DB_URI! },
});
