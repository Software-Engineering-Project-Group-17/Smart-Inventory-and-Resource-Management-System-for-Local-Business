// config/index.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4005,
  defaultPageSize: 25,
  maxPageSize: 200,

  // Prefer DATABASE_URL if present, else fall back to discrete vars.
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || null,
    database: process.env.DB_NAME || null,
    user: process.env.DB_USERNAME || null,
    password: process.env.DB_PASSWORD || null,
    port: Number(process.env.DB_PORT) || 5432,
    // Neon requires SSL – default to true
    ssl: process.env.DB_SSL ? process.env.DB_SSL === "true" : true
  }
};

// Helpful warning (but don't crash)
const hasUrl = !!config.db.connectionString;
const hasParts = !!(config.db.host && config.db.database && config.db.user && config.db.password);
if (!hasUrl && !hasParts) {
  console.warn(
    "[config] Database configuration missing. Provide either DATABASE_URL or DB_HOST/DB_NAME/DB_USERNAME/DB_PASSWORD."
  );
}
