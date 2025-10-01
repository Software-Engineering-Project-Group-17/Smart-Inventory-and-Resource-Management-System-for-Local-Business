// lib/api/analyticsApi.ts
// Works with your Express mounts:
//   /api/analytics, /api/sales, /api/inventory, /api/customers, /api/health

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005/api").replace(/\/+$/, "");
const INCLUDE_CREDS = String(process.env.NEXT_PUBLIC_INCLUDE_CREDENTIALS || "").toLowerCase() === "true";

// ---------- Core fetch with strong errors ----------
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  let res: Response;

  try {
    res = await fetch(url, {
      ...(INCLUDE_CREDS ? { credentials: "include" } : {}),
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err: any) {
    // Network/CORS/DNS failure
    throw new Error(`API request failed (network): ${err?.message || String(err)} @ ${url}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // This is the line you see in the console error — now with details
    throw new Error(`API request failed (${res.status} ${res.statusText}) @ ${url}\n${text.slice(0, 300)}`);
  }

  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`API request failed (expected JSON, got ${ct || "unknown"}) @ ${url}\n${text.slice(0, 300)}`);
  }

  try {
    return await res.json();
  } catch (e: any) {
    throw new Error(`API request failed (bad JSON): ${e?.message || "parse error"} @ ${url}`);
  }
}

// ---------- helpers ----------
function buildQueryString(params: Record<string, any> = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

const asArray = (v: any) => (Array.isArray(v?.data) ? v.data : Array.isArray(v) ? v : []);

// ==================== ANALYTICS API ====================
type Period = "1m" | "3m" | "6m" | "1y";

export const analyticsAPI = {
  getOverview: async (params: { period?: Period } = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/analytics/overview${q}`);
  },
  getQuickStats: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/analytics/quick-stats${q}`);
  },
  getQuickInsights: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/analytics/quick-insights${q}`);
  },
  getRevenueTrend: async (params: { period?: Period } = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/analytics/revenue-trend${q}`);
  },
  getOrderTrend: async (params: { period?: Period } = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/analytics/order-trend${q}`);
  },
  getPerformanceSummary: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/analytics/performance-summary${q}`);
  },
  getBusinessAlerts: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/analytics/business-alerts${q}`);
  },
};

// ==================== SALES API ====================
export const salesAPI = {
  getOverview: async (params: { period?: Period } = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/sales/overview${q}`);
  },
  getDailySales: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/sales/daily${q}`);
  },
  getSalesByCategory: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/sales/by-category${q}`);
  },
  getSalesByChannel: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/sales/by-channel${q}`);
  },
  getTopPerformers: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/sales/top-performers${q}`);
  },
  getHourlyPattern: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/sales/hourly-pattern${q}`);
  },
  getMetrics: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/sales/metrics${q}`);
  },
  getSalesGoals: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/sales/goals${q}`);
  },
};

// ==================== INVENTORY API ====================
export const inventoryAPI = {
  getOverview: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/overview${q}`);
  },
  getByCategory: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/by-category${q}`);
  },
  getStockLevels: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/stock-levels${q}`);
  },
  getMovement: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/inventory/movement${q}`);
  },
  getTopMoving: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/inventory/top-moving${q}`);
  },
  getWarehouseUtilization: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/warehouse-utilization${q}`);
  },
  getReorderAlerts: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/reorder-alerts${q}`);
  },
  getMetrics: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/inventory/metrics${q}`);
  },
};

// ==================== CUSTOMERS API ====================
export const customerAPI = {
  getOverview: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/customers/overview${q}`);
  },
  getSegments: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/customers/segments${q}`);
  },
  getAcquisition: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/customers/acquisition${q}`);
  },
  getDemographics: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/customers/demographics${q}`);
  },
  getBehavior: async () => fetchAPI(`/customers/behavior`),
  getTopCustomers: async (params: Record<string, any> = {}) => {
    const q = buildQueryString(params);
    return fetchAPI(`/customers/top-customers${q}`);
  },
  getRetention: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/customers/retention${q}`);
  },
  getMetrics: async (branchId?: string | number) => {
    const q = buildQueryString({ branchId });
    return fetchAPI(`/customers/metrics${q}`);
  },
};

// ==================== Utilities ====================
export const checkHealth = async () => {
  try {
    return await fetchAPI(`/health`);
  } catch (e: any) {
    return { status: "error", message: e?.message || "Health check failed" };
  }
};

export default { analytics: analyticsAPI, sales: salesAPI, inventory: inventoryAPI, customers: customerAPI, checkHealth };
