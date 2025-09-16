// utils/db.js
import { Pool } from "pg";
import { config } from "../config/index.js";

const basePoolOpts = {
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
};

export const pool = config.db.connectionString
  ? new Pool({
      connectionString: config.db.connectionString,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      ...basePoolOpts
    })
  : new Pool({
      host: config.db.host,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      port: config.db.port,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      ...basePoolOpts
    });

export const query = async (text, params = []) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (process.env.NODE_ENV !== "production") {
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
  }
  return res;
};
