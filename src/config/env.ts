import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_SCHEMA: z.string().min(1).default("public"),
  ECHO_API_KEY: z.string().min(1),
  ECHO_API_BASE_URL: z.string().url(),
  STAFF_ROLE_ID: z.string().min(1),
  KEY_PANEL_CHANNEL_ID: z.string().min(1),
  TRACKING_CHANNEL_ID: z.string().min(1),
  LOG_CHANNEL_ID: z.string().min(1),
  SCAN_POLL_INTERVAL_SECONDS: z.coerce.number().int().positive().default(30),
  SCAN_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(30)
});

export const env = envSchema.parse(process.env);