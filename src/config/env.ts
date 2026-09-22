import "dotenv/config";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  PORT: Number(process.env.PORT) || 3000,
  ACCESS_TOKEN_SECRET_KEY: process.env.ACCESS_TOKEN_SECRET_KEY!,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY!,
  API_URL: process.env.API_URL || "http://localhost:3000",
  CURSOR_SECRET: process.env.CURSOR_SECRET,
};
