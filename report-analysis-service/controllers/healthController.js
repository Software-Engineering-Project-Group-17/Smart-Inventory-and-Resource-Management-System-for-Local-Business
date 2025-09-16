import { query } from "../utils/db.js";

export const ping = async (req, res) => {
  const db = await query("SELECT 1 as ok");
  res.json({ ok: true, db: db.rows[0].ok === 1 });
};
