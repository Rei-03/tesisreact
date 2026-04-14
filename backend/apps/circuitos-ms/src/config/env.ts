import z from "zod";
import "dotenv/config";

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3003),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NATS_URLS: z.string()
    .default("nats://localhost:4222")
    .transform((val) => val.split(",")),
  // SQL Server (SIGERE) Configuration
  DB_SERVER_CIRCUITOS: z.string().default("localhost"),
  DB_USER_CIRCUITOS: z.string().default("sa"),
  DB_PASSWORD_CIRCUITOS: z.string().default("12341234"),
  DB_NAME_CIRCUITOS: z.string().default("SIGERE"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues.map((issue) => issue.message).join(", ")}`,
  );
}

export const env = parsedEnv.data;
