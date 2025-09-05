// src/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080/api";

import type { Category } from "./types";

// Raw DTO from backend (tolerant to a few variants)
export type CategoryDto = {
  id: number;
  // name variants
  category_name?: string;
  categoryName?: string;
  name?: string;
  // image url variants
  category_image_url?: string | null; // canonical from backend
  category_img_url?: string | null;   // legacy/typo
  categoryImageUrl?: string | null;
  categoryImgUrl?: string | null;
  imageUrl?: string | null;
};

/** Read JWT from localStorage (client only). If you use cookies, leave this empty. */
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** If you use cookie-based sessions, set this to true and ensure backend CORS allows credentials. */
const USE_COOKIES = false;

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/category/getall`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(), // sends Authorization: Bearer <jwt> when present
    },
    credentials: USE_COOKIES ? "include" : "same-origin",
  });

  // Helpful errors
  if (res.status === 401) {
    // Browser may still show a CORS error if the 401 response lacked CORS headers.
    throw new Error("Unauthorized (401): missing or invalid credentials.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to load categories (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  const data: CategoryDto[] = await res.json();

  return data.map((c) => ({
    id: c.id,
    name: c.category_name ?? c.categoryName ?? c.name ?? "",
    imageUrl:
      c.category_image_url ??
      c.category_img_url ??
      c.categoryImageUrl ??
      c.categoryImgUrl ??
      c.imageUrl ??
      null,
  }));
}
