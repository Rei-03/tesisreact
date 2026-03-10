import z from "zod";
import "dotenv/config";

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3002),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NATS_URLS: z.string()
    .default("nats://localhost:4222")
    .transform((val) => val.split(",")),
  // Database Configuration
  DB_HOST: z.string().default("postgres"),
  DB_PORT: z.coerce.number().min(1).max(65535).default(5432),
  DB_USERNAME: z.string().default("auth_user"),
  DB_PASSWORD: z.string().default("auth_password"),
  DB_NAME: z.string().default("auth_db"),
  DB_SYNCHRONIZE: z.enum(["true", "false"]).default("true"),
  DB_LOGGING: z.enum(["true", "false"]).default("true"),
  // JWT Configuration
  JWT_SECRET: z.string().default("your-secret-key-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("4h"),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("15d"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues.map((issue) => issue.message).join(", ")}`,
  );
}

export const env = parsedEnv.data;
