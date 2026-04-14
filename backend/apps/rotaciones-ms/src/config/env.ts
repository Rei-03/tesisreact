import z from "zod";
import "dotenv/config";

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NATS_URLS: z.string()
    .default("nats://localhost:4222")
    .transform((val) => val.split(",")),
  // SQL Server (PSFV) Configuration
  DB_SERVER_ROTACIONES: z.string().default("localhost"),
  DB_USER_ROTACIONES: z.string().default("sa"),
  DB_PASSWORD_ROTACIONES: z.string().default("12341234"),
  DB_NAME_ROTACIONES: z.string().default("PSFV"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues.map((issue) => issue.message).join(", ")}`,
  );
}

export const env = parsedEnv.data;
