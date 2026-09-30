import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
const isProduction = nodeEnv === "production";

const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 3000,
  mongoUri: isProduction ? required("MONGODB_URI_PROD") : required("MONGODB_URI_DEV"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export default config;
