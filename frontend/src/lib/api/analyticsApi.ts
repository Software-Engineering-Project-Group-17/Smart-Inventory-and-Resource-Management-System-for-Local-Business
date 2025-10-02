// lib/api/analyticsApi.ts
// Works with your Express mounts:
//   /api/analytics, /api/sales, /api/inventory, /api/customers, /api/health

const API_BASE_URL = (process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:4005/api").replace(/\/+$/, "");
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

// ==================== Realtime helper (SSE with WS fallback) ====================
export type RealtimeMessage = {
  topic?: string;
  event?: string;
  data?: any;
};

/**
 * subscribeRealtime
 * Minimal client that tries SSE first, then WS as fallback.
 * Auto-reconnects with exponential backoff. Returns an unsubscribe function.
 *
 * Expected backend:
 *   - SSE: GET `${API_BASE_URL}/realtime?topics=a,b,c` → `event: message` with JSON {topic,event,data}
 *   - WS:  `${API_BASE_URL (http→ws)}/realtime?topics=a,b,c` frames with same JSON
 */
export function subscribeRealtime(
  topics: string[],
  onMessage: (msg: RealtimeMessage) => void,
  opts: { ssePath?: string; wsPath?: string; withCredentials?: boolean } = {}
) {
  const ssePath = opts.ssePath || "/realtime"; // GET SSE
  const wsPath = opts.wsPath || "/realtime";   // WS path
  const withCreds = opts.withCredentials ?? INCLUDE_CREDS;

  let stopped = false;
  let cleanup: (() => void) | null = null;
  let attempt = 0;

  const params = buildQueryString({ topics: topics.join(",") });

  const trySSE = () => {
    try {
      // EventSource is browser-only; safe as long as you call this on the client
      // @ts-ignore
      const es = new EventSource(`${API_BASE_URL}${ssePath}${params}`, { withCredentials: withCreds } as EventSourceInit);
      const onMsg = (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data || "{}");
        // eslint-disable-next-line no-empty
        } catch (_) {}
        try {
          onMessage(JSON.parse(e.data || "{}"));
        } catch {
          // ignore non-JSON frames
        }
      };
      es.addEventListener("message", onMsg);
      es.addEventListener("error", () => {
        es.close();
        tryWS();
      });
      cleanup = () => es.close();
      return true;
    } catch {
      return false;
    }
  };

  const tryWS = () => {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws");
    const url = `${wsUrl}${wsPath}${params}`;
    let ws: WebSocket | null = null;

    const connect = () => {
      if (stopped) return;
      attempt++;
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try {
          onMessage(JSON.parse(String(e.data || "{}")));
        } catch {
          // ignore non-JSON frames
        }
      };
      ws.onclose = () => {
        if (stopped) return;
        const delay = Math.min(30000, Math.pow(2, attempt) * 250);
        setTimeout(connect, delay);
      };
      ws.onerror = () => {
        try { ws && ws.close(); } catch {}
      };
      cleanup = () => { try { ws && ws.close(); } catch {} };
    };

    connect();
  };

  // Kick off
  if (!trySSE()) tryWS();

  // Unsubscribe
  return () => {
    stopped = true;
    if (cleanup) cleanup();
  };
}

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

export default {
  analytics: analyticsAPI,
  sales: salesAPI,
  inventory: inventoryAPI,
  customers: customerAPI,
  subscribeRealtime,
  checkHealth,
};
