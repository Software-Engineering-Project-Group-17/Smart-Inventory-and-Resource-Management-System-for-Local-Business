import { config } from "../config/index.js";

export function parsePaging({ page = "1", pageSize = `${config.defaultPageSize}` }) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const ps = Math.min(Math.max(parseInt(pageSize, 10) || config.defaultPageSize, 1), config.maxPageSize);
  return { limit: ps, offset: (p - 1) * ps, page: p, pageSize: ps };
}

export function pageEnvelope({ items, total, page, pageSize }) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  return {
    meta: { page, pageSize, total, totalPages },
    data: items
  };
}
