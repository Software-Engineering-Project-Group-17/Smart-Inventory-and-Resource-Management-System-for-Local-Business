"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Filter,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { analyticsAPI, inventoryAPI, customerAPI } from "@/lib/api/analyticsApi";

// ---------------- Types ----------------
type AnalyticsId = "overview" | "sales" | "inventory" | "customers";
type InsightType = "success" | "warning" | "info" | "error";

type QuickStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  inventoryItems: number;
  growthRate: number;
  stockHealth?: number;
  retentionRate?: number;
  loading: boolean;
};

// ---------------- Routes ----------------
const analyticsRoute: Record<AnalyticsId, string> = {
  overview: "/analytics/overview",
  sales: "/analytics/sales",
  inventory: "/analytics/inventory",
  customers: "/analytics/customers",
};

// ---------------- Formatters ----------------
const fmtNumber = (n: number) => Number(n || 0).toLocaleString("en-US");
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n || 0)
  );
const fmtPct = (n?: number) =>
  n === undefined || n === null || Number.isNaN(Number(n))
    ? "—"
    : `${Number(n).toFixed(0)}%`;

// ---------------- Helpers ----------------
const unwrap = (res: any) => res?.data?.data ?? res?.data ?? res;

const pick = (obj: any, path: string) =>
  path
    .split(".")
    .reduce<any>((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const pickNum = (obj: any, keys: string[], fallback = 0): number => {
  for (const k of keys) {
    const v = pick(obj, k);
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
  }
  return fallback;
};

// Normalize /analytics/overview
const normalizeOverview = (data: any, seed: Omit<QuickStats, "loading">) => ({
  totalRevenue: pickNum(data, ["totalRevenue", "revenue", "value", "metrics.totalRevenue", "metrics.revenue"], seed.totalRevenue),
  totalOrders: pickNum(data, ["totalOrders", "orders", "metrics.totalOrders"], seed.totalOrders),
  totalCustomers: pickNum(data, ["totalCustomers", "customers", "metrics.totalCustomers"], seed.totalCustomers),
  inventoryItems: pickNum(
    data,
    ["inventoryItems", "stockItems", "inventory.totalItems", "inventory.total", "metrics.inventoryItems"],
    seed.inventoryItems
  ),
  growthRate: pickNum(data, ["growthRate", "revenueGrowth", "metrics.growthRate"], seed.growthRate),
});

// Normalize /analytics/quick-stats
const normalizeQuickStats = (data: any, seed: Omit<QuickStats, "loading">) => ({
  totalRevenue: pickNum(data, ["totalRevenue", "revenue", "stats.totalRevenue"], seed.totalRevenue),
  totalOrders: pickNum(data, ["totalOrders", "orders", "stats.totalOrders"], seed.totalOrders),
  totalCustomers: pickNum(data, ["totalCustomers", "customers", "stats.totalCustomers"], seed.totalCustomers),
  inventoryItems: pickNum(data, ["inventoryItems", "items", "stats.inventoryItems"], seed.inventoryItems),
  growthRate: pickNum(data, ["growthRate", "revenueGrowth", "stats.growthRate"], seed.growthRate),
});

// Normalize /inventory/*
const normalizeInventory = (data: any, seed: Omit<QuickStats, "loading">) => ({
  inventoryItems: pickNum(
    data,
    [
      "totalItems",
      "itemsInStock",
      "inStock",
      "inventoryItems",
      "inventory.totalItems",
      "inventory.total",
      "counts.totalItems",
      "counts.items",
      "skuCount",
      "productCount",
      "totalProducts",
      "products.total",
      "items.total",
      "stock.totalItems",
    ],
    seed.inventoryItems
  ),
  stockHealth: pickNum(
    data,
    [
      "stockHealth",
      "stockHealthPercent",
      "metrics.stockHealth",
      "metrics.stockHealthPercent",
      "inventory.health",
      "healthPercent",
    ],
    seed.stockHealth ?? 0
  ),
});

// Normalize /customers/*
const normalizeCustomers = (data: any, seed: Omit<QuickStats, "loading">) => ({
  totalCustomers: pickNum(
    data,
    ["activeCustomers", "totalCustomers", "customers", "metrics.activeCustomers", "metrics.totalCustomers", "counts.customers"],
    seed.totalCustomers
  ),
  retentionRate: pickNum(
    data,
    ["retentionRate", "customerRetention", "metrics.retentionRate", "metrics.customerRetention"],
    seed.retentionRate ?? 0
  ),
});

// Normalize quick insights (safe)
const normalizeInsights = (arr: any[] = []) => {
  const toModuleId = (s?: string): AnalyticsId => {
    const t = String(s || "").toLowerCase();
    if (t.includes("sale")) return "sales";
    if (t.includes("invent")) return "inventory";
    if (t.includes("customer")) return "customers";
    return "overview";
  };
  return arr.map((raw) => {
    const typeRaw = (raw?.type || raw?.severity || "info").toLowerCase();
    const candidates = ["success", "warning", "error", "info"];
    const type: InsightType = (candidates.includes(typeRaw) ? typeRaw : "info") as InsightType;
    const title = raw?.title || raw?.name || "Insight";
    const message = raw?.message || raw?.detail || "";
    const action = raw?.action || raw?.cta || "Open module";
    let goto: AnalyticsId = "overview";
    const g = (raw?.goto || raw?.module) as string | undefined;
    goto = g && (["overview", "sales", "inventory", "customers"] as string[]).includes(g.toLowerCase())
      ? (g.toLowerCase() as AnalyticsId)
      : toModuleId(g);
    const icon = type === "success" ? CheckCircle : type === "warning" || type === "error" ? AlertCircle : TrendingUp;
    return { type, icon, title, message, action, goto };
  });
};

export default function AnalyticsNavigation() {
  const router = useRouter();

  const [error, setError] = useState("");

  // >>> ALL DEFAULTS ZERO <<<
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    inventoryItems: 0,
    growthRate: 0,
    stockHealth: 0,
    retentionRate: 0,
    loading: false,
  });

  const [insights, setInsights] = useState<
    Array<{ type: InsightType; icon: any; title: string; message: string; action: string; goto: AnalyticsId }>
  >([]);

  const period = "1m";
  const branchId: string | undefined = undefined;

  const navigateById = useCallback(
    (id: AnalyticsId) => router.push(analyticsRoute[id] ?? "/analytics"),
    [router]
  );

  useEffect(() => {
    let alive = true;

    // small helper to swallow errors and return fallback
    const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await p;
      } catch {
        return fallback;
      }
    };

    (async () => {
      try {
        setQuickStats((s) => ({ ...s, loading: true }));

        // Make insights call SAFE so a 500 never bubbles
        const safeQuickInsights = safe(analyticsAPI.getQuickInsights(branchId), { data: [] as any[] });

        const [
          overviewRes,
          quickStatsRes,
          quickInsightsRes,
          invMetricsRes,
          custMetricsRes,
          invOverviewRes,
          custOverviewRes,
          stockLevelsRes,
          byCategoryRes,
        ] = await Promise.allSettled([
          analyticsAPI.getOverview({ period }),
          analyticsAPI.getQuickStats(branchId),
          safeQuickInsights,                           // <— safe
          inventoryAPI.getMetrics(branchId),
          customerAPI.getMetrics(branchId),
          inventoryAPI.getOverview(branchId),
          customerAPI.getOverview(branchId),
          inventoryAPI.getStockLevels(branchId),
          inventoryAPI.getByCategory(branchId),
        ]);

        const seed = (({ loading, ...rest }) => rest)(quickStats);

        // 1) overview
        let merged = seed;
        if (overviewRes.status === "fulfilled" && overviewRes.value) {
          const raw = unwrap(overviewRes.value);
          merged = { ...merged, ...normalizeOverview(raw, merged) };
        }

        // 2) quick-stats
        if (quickStatsRes.status === "fulfilled" && quickStatsRes.value) {
          const raw = unwrap(quickStatsRes.value);
          merged = { ...merged, ...normalizeQuickStats(raw, merged) };
        }

        // 3) inventory metrics/overview
        let invRaw: any = undefined;
        if (invMetricsRes.status === "fulfilled" && invMetricsRes.value) {
          invRaw = unwrap(invMetricsRes.value);
          merged = { ...merged, ...normalizeInventory(invRaw, merged) };
        } else if (invOverviewRes.status === "fulfilled" && invOverviewRes.value) {
          invRaw = unwrap(invOverviewRes.value);
          merged = { ...merged, ...normalizeInventory(invRaw, merged) };
        }

        // Prefer Stock Levels total (matches Inventory page)
        const stockLevelsRaw =
          stockLevelsRes.status === "fulfilled" && stockLevelsRes.value ? unwrap(stockLevelsRes.value) : undefined;
        const byCategoryRaw =
          byCategoryRes.status === "fulfilled" && byCategoryRes.value ? unwrap(byCategoryRes.value) : [];

        const totalItemsDirect = Number(
          (invRaw?.totalItems ??
            invRaw?.inventoryItems ??
            invRaw?.items?.total ??
            invRaw?.counts?.totalItems ??
            invRaw?.products?.total ??
            invRaw?.items?.count) ?? 0
        );

        const mIn = Number(invRaw?.totalStock ?? invRaw?.inStock ?? invRaw?.totals?.inStock ?? 0);
        const mLow = Number(invRaw?.totalLowStock ?? invRaw?.lowStock ?? invRaw?.totals?.lowStock ?? 0);
        const mOut = Number(invRaw?.totalOutOfStock ?? invRaw?.outOfStock ?? invRaw?.totals?.outOfStock ?? 0);
        const sumM = mIn + mLow + mOut;

        const sIn = Number(stockLevelsRaw?.inStock ?? stockLevelsRaw?.in_stock ?? 0);
        const sLow = Number(stockLevelsRaw?.lowStock ?? stockLevelsRaw?.low_stock ?? 0);
        const sOut = Number(stockLevelsRaw?.outOfStock ?? stockLevelsRaw?.out_of_stock ?? 0);
        const sumS = sIn + sLow + sOut;

        const sumByCat = Array.isArray(byCategoryRaw)
          ? byCategoryRaw.reduce((acc: number, c: any) => acc + Number(c.stock ?? c.inStock ?? 0), 0)
          : 0;

        const correctedTotal =
          (sumS > 0 ? sumS : 0) ||
          (sumByCat > 0 ? sumByCat : 0) ||
          (sumM > 0 ? sumM : 0) ||
          (Number.isFinite(totalItemsDirect) && totalItemsDirect > 0 ? totalItemsDirect : 0);

        if (correctedTotal > 0) {
          merged.inventoryItems = correctedTotal;

          if (!merged.stockHealth || merged.stockHealth === 0) {
            const denom = sumS || correctedTotal || 1;
            const goodLike = (sIn || mIn || sumByCat) - (sLow || mLow || 0) - (sOut || mOut || 0);
            const health = Math.max(0, Math.min(100, (goodLike / denom) * 100));
            merged.stockHealth = Math.round(health);
          }
        }

        // 4) customer metrics/overview
        if (custMetricsRes.status === "fulfilled" && custMetricsRes.value) {
          const raw = unwrap(custMetricsRes.value);
          merged = { ...merged, ...normalizeCustomers(raw, merged) };
        } else if (custOverviewRes.status === "fulfilled" && custOverviewRes.value) {
          const raw = unwrap(custOverviewRes.value);
          merged = { ...merged, ...normalizeCustomers(raw, merged) };
        }

        if (alive) {
          setQuickStats((s) => ({ ...s, ...merged, loading: false }));
        }

        // Quick insights (safe fallback to empty list)
        if (alive) {
          if (quickInsightsRes.status === "fulfilled" && quickInsightsRes.value) {
            const rawArr = Array.isArray(unwrap(quickInsightsRes.value)) ? unwrap(quickInsightsRes.value) : [];
            setInsights(normalizeInsights(rawArr));
          } else {
            setInsights([]);
          }
        }
      } catch (e: any) {
        if (alive) {
          setError((e?.message as string)?.split("\n")[0] || "Failed to load analytics");
          setQuickStats((s) => ({ ...s, loading: false }));
        }
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInsightColor = (type: InsightType | string) => {
    switch ((type || "").toString().toLowerCase()) {
      case "success":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" };
      case "warning":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "text-yellow-600" };
      case "error":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" };
      case "info":
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "text-blue-600" };
    }
  };

  const modules = [
    {
      id: "overview" as const,
      title: "Business Overview",
      description: "Comprehensive dashboard with key performance indicators and business metrics",
      icon: BarChart3,
      color: "#3674B5",
      features: ["Revenue tracking", "Order analytics", "Customer insights", "Performance KPIs"],
      metrics: {
        primary: fmtUSD(quickStats.totalRevenue),
        primaryLabel: "Total Revenue",
        secondary: `${quickStats.growthRate > 0 ? "+" : ""}${quickStats.growthRate}%`,
        secondaryLabel: "Growth Rate",
      },
    },
    {
      id: "sales" as const,
      title: "Sales Analytics",
      description: "Track sales performance, identify trends, and optimize revenue generation",
      icon: TrendingUp,
      color: "#10B981",
      features: ["Sales trends", "Channel analysis", "Performance tracking", "Goal monitoring"],
      metrics: {
        primary: fmtNumber(quickStats.totalOrders),
        primaryLabel: "Total Orders",
        secondary: "+12.3%",
        secondaryLabel: "Month Growth",
      },
    },
    {
      id: "inventory" as const,
      title: "Inventory Analytics",
      description: "Monitor stock levels, turnover rates, and inventory optimization opportunities",
      icon: Package,
      color: "#8B5CF6",
      features: ["Stock monitoring", "Turnover analysis", "Reorder alerts", "Warehouse utilization"],
      metrics: {
        primary: fmtNumber(quickStats.inventoryItems),
        primaryLabel: "Items in Stock",
        secondary: fmtPct(quickStats.stockHealth ?? 0),
        secondaryLabel: "Stock Health",
      },
    },
    {
      id: "customers" as const,
      title: "Customer Analytics",
      description: "Understand customer behavior, segments, and lifetime value patterns",
      icon: Users,
      color: "#F59E0B",
      features: ["Customer segmentation", "Retention analysis", "Behavior tracking", "Lifetime value"],
      metrics: {
        primary: fmtNumber(quickStats.totalCustomers),
        primaryLabel: "Active Customers",
        secondary: fmtPct(quickStats.retentionRate ?? 0),
        secondaryLabel: "Retention Rate",
      },
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
              <Activity size={24} aria-hidden />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics Hub</h1>
              <p className="text-gray-600">Comprehensive insights and data visualization for informed decision making</p>
            </div>
          </div>
          {error && (
            <div role="status" aria-live="polite" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-3">
            Access real-time analytics across sales, inventory, customers, and business performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <DollarSign size={24} aria-hidden />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{fmtUSD(quickStats.totalRevenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp size={16} aria-hidden />
              <span className="text-sm font-medium">
                {quickStats.growthRate > 0 ? "+" : ""}
                {quickStats.growthRate}% vs last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <ShoppingCart size={24} aria-hidden />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.totalOrders)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-blue-600">
              <TrendingUp size={16} aria-hidden />
              <span className="text-sm font-medium">+4.2% vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Users size={24} aria-hidden />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.totalCustomers)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-yellow-600">
              <TrendingUp size={16} aria-hidden />
              <span className="text-sm font-medium">{fmtPct(quickStats.retentionRate ?? 0)} retention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <Package size={24} aria-hidden />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.inventoryItems)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-purple-600">
              <CheckCircle size={16} aria-hidden />
              <span className="text-sm font-medium">{fmtPct(quickStats.stockHealth ?? 0)} stock health</span>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const colors = getInsightColor(insight.type);
              const IconComponent = insight.icon;
              return (
                <div key={index} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className={colors.icon} size={20} aria-hidden />
                    <div className="flex-1">
                      <h3 className={`font-medium ${colors.text} mb-1`}>{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                      <button
                        type="button"
                        onClick={() => navigateById(insight.goto)}
                        className={`text-sm font-medium ${colors.icon} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 rounded`}
                        aria-label={insight.action}
                      >
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules.map((module) => {
              const IconComponent = module.icon;
              const href = analyticsRoute[module.id];
              return (
                <div
                  key={module.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateById(module.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") navigateById(module.id);
                  }}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  aria-label={`Go to ${module.title}`}
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg text-white" style={{ backgroundColor: module.color }}>
                          <IconComponent size={24} aria-hidden />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" size={20} aria-hidden />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{module.metrics.primaryLabel}</p>
                        <p className="text-2xl font-bold text-gray-900">{module.metrics.primary}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{module.metrics.secondaryLabel}</p>
                        <p className="text-2xl font-bold text-green-600">{module.metrics.secondary}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <Link
                        href={href}
                        className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open ${module.title} in a new tab`}
                      >
                        Open {module.title}
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: module.color }} />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started with Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 size={20} className="text-blue-600" aria-hidden />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Explore Dashboards</h4>
                <p className="text-sm text-gray-600">Navigate through different analytics modules to gain insights</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Filter size={20} className="text-green-600" aria-hidden />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Apply Filters</h4>
                <p className="text-sm text-gray-600">Customize views with date ranges, categories, and segments</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar size={20} className="text-purple-600" aria-hidden />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Track Trends</h4>
                <p className="text-sm text-gray-600">Monitor performance over time and identify patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
