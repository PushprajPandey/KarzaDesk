import dotenv from "dotenv";

dotenv.config();

type EnvShape = {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

const takeString = (key: keyof EnvShape, fallback?: string): string => {
  const raw = process.env[key as string] ?? fallback;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`Missing environment variable: ${String(key)}`);
  }
  return raw;
};

const takeNumber = (key: keyof EnvShape, fallback?: string): number => {
  const raw = takeString(key, fallback);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid number for environment variable: ${String(key)}`);
  }
  return parsed;
};

export const env: EnvShape = {
  PORT: takeNumber("PORT", "8080"),
  MONGO_URI: takeString("MONGO_URI"),
  JWT_SECRET: takeString("JWT_SECRET"),
  FRONTEND_URL: takeString("FRONTEND_URL", "https://karza-desk.vercel.app"),
};
