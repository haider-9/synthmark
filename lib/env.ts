import { z } from "zod";

const envSchema = z.object({
  DB_URI: z.url("DB_URI must be a valid PostgreSQL connection URL"),
  CLOUDINARY_CLOUD: z.string().min(1, "CLOUDINARY_CLOUD is required"),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  NEXT_PUBLIC_SITE_URL: z.url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Environment variable validation failed:\n");
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error();
  process.exit(1);
}

export const env = parsed.data;
