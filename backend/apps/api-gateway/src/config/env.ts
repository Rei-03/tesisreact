import z from "zod";
import "dotenv/config";

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NATS_URLS: z.string()
    .default("nats://localhost:4222")
    .transform((val) => val.split(",")),
  // Redis Configuration
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
  // JWT Configuration
  JWT_SECRET: z.string().default("your-secret-key-change-in-production"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues.map((issue) => issue.message).join(", ")}`,
  );
}

export const env = parsedEnv.data;
