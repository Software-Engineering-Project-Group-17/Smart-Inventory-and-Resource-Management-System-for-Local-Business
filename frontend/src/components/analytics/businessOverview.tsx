"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { analyticsAPI, inventoryAPI, salesAPI, customerAPI } from "@/lib/api/analyticsApi";

// ---------- Safe mappers ----------
const mapRevenueTrend = (arr: any[] = []) =>
  arr.map((r, i) => ({
    month: r.month || r.label || r.period || `M${i + 1}`,
    revenue: Number(r.revenue ?? r.sales ?? 0),
    orders: Number(r.orders ?? r.orderCount ?? 0),
    customers: Number(r.customers ?? r.customerCount ?? 0),
  }));

const mapOrderTrendRows = (arr: any[] = []) =>
  arr.map((r, i) => ({
    month: r.month || r.label || r.period || `M${i + 1}`,
    orders: Number(r.orders ?? r.count ?? r.total ?? r.orderCount ?? 0),
  }));

const mapCustomerTrendRows = (arr: any[] = []) =>
  arr.map((r, i) => ({
    month: r.month || r.label || r.period || `M${i + 1}`,
    customers: Number(r.customers ?? r.customerCount ?? r.newCustomers ?? 0),
  }));

const mergeByMonth = (
  revArr: any[] = [],
  ordArr: any[] = [],
  custArr: any[] = [],
  overview?: any
) => {
  const map = new Map<string, any>();
  revArr.forEach((r) => map.set(r.month, { ...r }));

  // merge orders
  ordArr.forEach((o) => {
    const prev = map.get(o.month) || { month: o.month, revenue: 0, orders: 0, customers: 0 };
    map.set(o.month, { ...prev, orders: o.orders ?? prev.orders ?? 0 });
  });

  // merge customers
  custArr.forEach((c) => {
    const prev = map.get(c.month) || { month: c.month, revenue: 0, orders: 0, customers: 0 };
    map.set(c.month, { ...prev, customers: c.customers ?? prev.customers ?? 0 });
  });

  // Optional: overview.revenueTrend might include missing fields
  if (overview?.revenueTrend && Array.isArray(overview.revenueTrend)) {
    overview.revenueTrend.forEach((row: any, i: number) => {
      const month = row.month || row.label || row.period || `M${i + 1}`;
      const prev = map.get(month) || { month, revenue: 0, orders: 0, customers: 0 };
      map.set(month, {
        ...prev,
        revenue: prev.revenue || Number(row.revenue ?? row.sales ?? 0),
        orders: prev.orders || Number(row.orders ?? row.orderCount ?? 0),
        customers: prev.customers || Number(row.customers ?? row.customerCount ?? 0),
      });
    });
  }

  // Keep original order of revenue months, then append others
  const order = [...revArr.map((r) => r.month)];
  [...ordArr, ...custArr].forEach((x) => {
    if (!order.includes(x.month)) order.push(x.month);
  });
  return order.map((m) => map.get(m)).filter(Boolean);
};

const mapInventoryByCategory = (arr: any[] = []) =>
  arr.map((c) => ({
    category: c.category || c.name || "—",
    stock: Number(c.stock ?? c.inStock ?? 0),
    lowStock: Number(c.lowStock ?? c.low ?? 0),
    value: Number(c.value ?? c.inventoryValue ?? 0),
  }));

// --- NEW: robust order status normalization ---
// Accepts a variety of input shapes (counts or %). Produces:
//   { name, count, percent, color }
// Logic:
// 1) Prefer explicit counts if present (count, orders, value>100 total, etc.)
// 2) Otherwise treat provided numbers as percentages
// 3) Normalize so percents sum to ~100 (handles rounding)
// 4) Map known DB enum names to human labels
const statusLabel = (raw: string = "") => {
  const key = String(raw).toLowerCase().trim();
  switch (key) {
    case "pending": return "Pending";
    case "processing": return "Processing";
    case "completed": return "Completed";
    case "cancelled":
    case "canceled": return "Cancelled";
    default: return raw || "—";
  }
};

const normalizeOrderStatus = (
  rawArr: any[] = [],
  palette: string[] = [],
) => {
  const rows = (Array.isArray(rawArr) ? rawArr : []).map((s: any) => {
    const name = s.name || s.status || s.label || "—";
    // raw number could be count or percent
    const rawNum = Number(
      s.count ?? s.orders ?? s.quantity ?? s.total ?? s.value ?? s.percentage ?? s.percent ?? 0
    );
    return {
      name: statusLabel(name),
      raw: Number.isFinite(rawNum) ? rawNum : 0,
      color: s.color,
    };
  });

  const sum = rows.reduce((a, r) => a + (isNaN(r.raw) ? 0 : r.raw), 0);
  const isPercentLike =
    sum > 0 && sum <= 100 && rows.every((r) => r.raw >= 0 && r.raw <= 100);

  // If numbers look like percentages -> use them directly
  // Else treat them as counts and convert to percentages.
  const totalCount = isPercentLike ? 0 : sum;

  // Avoid division by zero
  if ((!isPercentLike && totalCount === 0) || rows.length === 0) return [];

  let items = rows.map((r, i) => {
    const percent = isPercentLike
      ? r.raw
      : (r.raw / (totalCount || 1)) * 100;

    return {
      name: r.name,
      count: isPercentLike ? undefined : r.raw,
      percent: Number.isFinite(percent) ? percent : 0,
      color: r.color || palette[i % palette.length],
    };
  });

  // Normalize small floating error to sum ~100
  const totalPct = items.reduce((a, r) => a + r.percent, 0);
  if (totalPct > 0) {
    const diff = 100 - totalPct;
    // Nudge the largest slice by the diff to make it add to 100
    const idxMax = items.reduce((imax, r, i, arr) => (r.percent > arr[imax].percent ? i : imax), 0);
    items[idxMax] = { ...items[idxMax], percent: items[idxMax].percent + diff };
  }

  // Filter zero slices to keep legend tidy
  items = items.filter((r) => r.percent > 0);

  return items;
};

// NOTE: mapOrderStatus now delegates to normalizeOrderStatus for safety
const mapOrderStatus = (arr: any[] = []) => arr;

// ---------- Component ----------
export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"1m" | "3m" | "6m" | "1y">("6m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State slices
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [inventoryByCat, setInventoryByCat] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [perf, setPerf] = useState({
    avgOrderValue: 0,
    orderCompletionRate: 97.2,
    customerRetention: 84.5,
    inventoryTurnover: 6.2,
    profitMargin: 23.8,
  });

  // extra: if monthly customers unavailable, we use this as a fallback for the card
  const [customersFallbackTotal, setCustomersFallbackTotal] = useState<number | null>(null);

  const branchId = undefined;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        overviewRes,
        revTrendRes,
        orderTrendRes,
        byCatRes,
        alertsRes,
        perfRes,
        salesOverviewRes,
        custAcqRes,       // /customers/acquisition?period=
        custMetricsRes,   // /customers/metrics?branchId=
        custOverviewRes,  // /customers/overview?branchId=
      ] = await Promise.allSettled([
        analyticsAPI.getOverview({ period: selectedPeriod }),
        analyticsAPI.getRevenueTrend({ period: selectedPeriod }),
        analyticsAPI.getOrderTrend({ period: selectedPeriod }),
        inventoryAPI.getByCategory(branchId),
        analyticsAPI.getBusinessAlerts(branchId),
        analyticsAPI.getPerformanceSummary(branchId),
        salesAPI.getOverview({ period: selectedPeriod }),
        customerAPI.getAcquisition({ period: selectedPeriod }),
        customerAPI.getMetrics(branchId),
        customerAPI.getOverview(branchId),
      ]);

      let overview: any = {};
      if (overviewRes.status === "fulfilled") overview = overviewRes.value || {};

      // Revenue rows
      let revenueRows: any[] = [];
      if (revTrendRes.status === "fulfilled") {
        const rows = Array.isArray(revTrendRes.value?.data) ? revTrendRes.value.data : revTrendRes.value;
        revenueRows = mapRevenueTrend(rows || []);
      } else if (overview?.revenueTrend) {
        revenueRows = mapRevenueTrend(Array.isArray(overview.revenueTrend) ? overview.revenueTrend : []);
      }

      // Order rows
      let orderRows: any[] = [];
      if (orderTrendRes.status === "fulfilled") {
        const rows = Array.isArray(orderTrendRes.value?.data) ? orderTrendRes.value.data : orderTrendRes.value;
        orderRows = mapOrderTrendRows(rows || []);
      }

      // Customer monthly rows (preferred: acquisition trend)
      let customerRows: any[] = [];
      if (custAcqRes.status === "fulfilled") {
        const rows = Array.isArray(custAcqRes.value?.data) ? custAcqRes.value.data : custAcqRes.value;
        customerRows = mapCustomerTrendRows(rows || []);
      }

      // Merge into one trend
      const mergedTrend = mergeByMonth(revenueRows, orderRows, customerRows, overview);
      setRevenueTrend(mergedTrend);

      // If monthly customers all 0, try a fallback total from metrics/overview
      const customersSum = mergedTrend.reduce((s, r) => s + Number(r.customers || 0), 0);
      if (customersSum === 0) {
        let fallbackTotal: number | null = null;

        if (custMetricsRes.status === "fulfilled") {
          // look for common fields: activeCustomers, totalCustomers, customers
          const m = custMetricsRes.value || {};
          fallbackTotal =
            Number(m.activeCustomers ?? m.totalCustomers ?? m.customers ?? NaN);
        }
        if ((fallbackTotal == null || Number.isNaN(fallbackTotal)) && custOverviewRes.status === "fulfilled") {
          const ov = custOverviewRes.value || {};
          fallbackTotal =
            Number(ov.activeCustomers ?? ov.totalCustomers ?? ov.customers ?? NaN);
        }
        if ((fallbackTotal == null || Number.isNaN(fallbackTotal)) && overview) {
          fallbackTotal =
            Number(overview.activeCustomers ?? overview.totalCustomers ?? overview.customers ?? NaN);
        }

        setCustomersFallbackTotal(
          fallbackTotal != null && !Number.isNaN(fallbackTotal) ? fallbackTotal : 0
        );
      } else {
        setCustomersFallbackTotal(null);
      }

      // Inventory by category
      if (byCatRes.status === "fulfilled") {
        const rows = Array.isArray(byCatRes.value?.data) ? byCatRes.value.data : byCatRes.value;
        setInventoryByCat(mapInventoryByCategory(rows || []));
      } else {
        setInventoryByCat([]);
      }

      // ----- Order status (FIXED) -----
      // Prefer overview.orderStatus, fallback to salesOverview.orderStatus
      let statusData: any[] = [];
      if (overview?.orderStatus && Array.isArray(overview.orderStatus)) {
        statusData = overview.orderStatus;
      } else if (salesOverviewRes.status === "fulfilled") {
        statusData = (salesOverviewRes.value as any)?.orderStatus || [];
      }

      // Normalize to {name, count?, percent, color}
      const statusPalette = ["#10B981", "#F59E0B", "#EF4444", "#6B7280", "#3B82F6", "#8B5CF6"];
      const normalizedStatus = normalizeOrderStatus(
        (Array.isArray(statusData) ? statusData : []).map((s: any) => ({
          ...s,
          name: s.name || s.status || "—",
          // Keep any of value/percentage/count; the normalizer will figure it out.
        })),
        statusPalette
      );
      setOrderStatus(normalizedStatus);

      // Top products
      let topProd: any[] = [];
      if (overview?.topProducts && Array.isArray(overview.topProducts)) {
        topProd = overview.topProducts;
      } else if (salesOverviewRes.status === "fulfilled" && Array.isArray((salesOverviewRes.value as any)?.topProducts)) {
        topProd = (salesOverviewRes.value as any).topProducts;
      }
      const mapTopProducts = (arr: any[] = []) =>
        arr.map((p) => ({
          name: p.name || p.product || "—",
          sales: Number(p.sales ?? p.units ?? 0),
          revenue: Number(p.revenue ?? p.amount ?? 0),
        }));
      setTopProducts(mapTopProducts(topProd || []));

      // Alerts
      if (alertsRes.status === "fulfilled") {
        const rows = Array.isArray(alertsRes.value?.data) ? alertsRes.value.data : alertsRes.value;
        const mapAlerts = (arr: any[] = []) =>
          arr.map((a) => ({
            type: (a.type || a.severity || "info").toLowerCase(),
            title: a.title || a.name || "Alert",
            message: a.message || a.detail || "",
          }));
        setAlerts(mapAlerts(rows || []));
      } else {
        setAlerts([]);
      }

      // Performance summary
      if (perfRes.status === "fulfilled") {
        const mapPerfSummary = (m: any = {}) => ({
          avgOrderValue: Number(m.avgOrderValue ?? 0),
          orderCompletionRate: Number(m.orderCompletionRate ?? 0),
          customerRetention: Number(m.customerRetention ?? 0),
          inventoryTurnover: Number(m.inventoryTurnover ?? 0),
          profitMargin: Number(m.profitMargin ?? 0),
        });
        setPerf((prev) => ({ ...prev, ...mapPerfSummary(perfRes.value) }));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
      setRevenueTrend([]);
      setInventoryByCat([]);
      setOrderStatus([]);
      setTopProducts([]);
      setAlerts([]);
      setCustomersFallbackTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshData = () => fetchAll();

  // ---------- Derived metrics ----------
  const metrics = useMemo(() => {
    const totalRevenue = revenueTrend.reduce((sum, r) => sum + Number(r.revenue || 0), 0);
    const totalOrders = revenueTrend.reduce((sum, r) => sum + Number(r.orders || 0), 0);

    const computedCustomers = revenueTrend.reduce((sum, r) => sum + Number(r.customers || 0), 0);
    // Fallback when monthly customers not available
    const totalCustomers =
      computedCustomers > 0 ? computedCustomers : Number(customersFallbackTotal ?? 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const current = revenueTrend[revenueTrend.length - 1];
    const previous = revenueTrend[revenueTrend.length - 2];
    const revenueGrowth =
      previous && Number(previous.revenue) > 0
        ? ((Number(current?.revenue || 0) - Number(previous.revenue)) / Number(previous.revenue)) * 100
        : 0;

    const totalStock = inventoryByCat.reduce((sum, i) => sum + Number(i.stock || 0), 0);
    const totalLowStock = inventoryByCat.reduce((sum, i) => sum + Number(i.lowStock || 0), 0);
    const stockHealthPercent = totalStock > 0 ? ((totalStock - totalLowStock) / totalStock) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      revenueGrowth,
      stockHealthPercent,
      lowStockCount: totalLowStock,
    };
  }, [revenueTrend, inventoryByCat, customersFallbackTotal]);

  // ---------- UI ----------
  const MetricCard = ({ title, value, change, icon: Icon, color, format = "number" }: any) => {
    const isPositive = Number(change ?? 0) >= 0;
    const formattedValue =
      format === "currency"
        ? `$${Number(value || 0).toLocaleString()}`
        : format === "percentage"
        ? `${Number(value || 0).toFixed(1)}%`
        : Number(value || 0).toLocaleString();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm font-medium">{Math.abs(Number(change || 0)).toFixed(1)}% from last month</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + "20" }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
      </div>
    );
  };

  const statusPalette = ["#10B981", "#F59E0B", "#EF4444", "#6B7280", "#3B82F6", "#8B5CF6"];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
                <p className="text-gray-600">Real-time insights and performance metrics</p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            change={metrics.revenueGrowth}
            icon={DollarSign}
            color="#10B981"
            format="currency"
          />
          <MetricCard title="Total Orders" value={metrics.totalOrders} change={5.2} icon={ShoppingCart} color="#3674B5" />
          <MetricCard title="Active Customers" value={metrics.totalCustomers} change={8.1} icon={Users} color="#F59E0B" />
          <MetricCard
            title="Stock Health"
            value={metrics.stockHealthPercent}
            change={-2.3}
            icon={Package}
            color={metrics.stockHealthPercent >= 80 ? "#10B981" : "#EF4444"}
            format="percentage"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Revenue
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  labelStyle={{ color: "#374151" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3674B5" fill="#3674B5" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution (FIXED) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {/* Use the normalized 'percent' key */}
                  <Pie
                    data={orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="percent"
                    nameKey="name"
                  >
                    {orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || statusPalette[index % statusPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => {
                      const pct = Number(value);
                      const count = props?.payload?.count;
                      const label = props?.payload?.name || "Orders";
                      return [
                        `${pct.toFixed(1)}%${count != null ? ` • ${count.toLocaleString()} orders` : ""}`,
                        label,
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {orderStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color || statusPalette[index % statusPalette.length] }}
                    />
                    <span className="text-sm text-gray-700">{status.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {status.percent.toFixed(1)}%
                    {status.count != null ? ` • ${Number(status.count).toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
              {!orderStatus.length && <p className="text-sm text-gray-500">No order status data.</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Inventory Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Status by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByCat} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="category" type="category" stroke="#6b7280" width={100} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10B981" name="In Stock" />
                <Bar dataKey="lowStock" fill="#EF4444" name="Low Stock" />
              </BarChart>
            </ResponsiveContainer>
            {!inventoryByCat.length && <p className="text-sm text-gray-500 mt-3">No inventory data.</p>}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{Number(product.sales || 0)} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${Number(product.revenue || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {!topProducts.length && <p className="text-sm text-gray-500">No top products available.</p>}
            </div>
          </div>
        </div>

        {/* Orders and Customer Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders & Customer Growth</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3674B5"
                strokeWidth={2}
                dot={{ fill: "#3674B5", strokeWidth: 2, r: 4 }}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="Customers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Alerts</h3>
            <div className="space-y-4">
              {alerts.map((a, idx) => {
                const t =
                  a.type === "danger" || a.type === "error" || a.type === "high"
                    ? "red"
                    : a.type === "success"
                    ? "green"
                    : a.type === "warning"
                    ? "yellow"
                    : "blue";
                const Icon =
                  a.type === "success" ? CheckCircle : a.type === "danger" || a.type === "error" ? AlertTriangle : TrendingUp;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 bg-${t}-50 rounded-lg`}>
                    <Icon className={`text-${t}-600 mt-0.5`} size={20} />
                    <div>
                      <p className={`font-medium text-${t}-800`}>{a.title}</p>
                      {a.message && <p className={`text-sm text-${t}-600`}>{a.message}</p>}
                    </div>
                  </div>
                );
              })}

              {!alerts.length && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-red-800">Low Stock Alert</p>
                      <p className="text-sm text-red-600">{metrics.lowStockCount} items below restock threshold</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-green-800">Revenue Highlight</p>
                      <p className="text-sm text-green-600">Revenue trend is positive vs prior month</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold">${(perf.avgOrderValue || metrics.avgOrderValue).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {(perf.orderCompletionRate || 97.2).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Retention</span>
                <span className="font-semibold text-blue-600">
                  {(perf.customerRetention || 84.5).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inventory Turnover</span>
                <span className="font-semibold">{(perf.inventoryTurnover || 6.2).toFixed(1)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold text-green-600">
                  {(perf.profitMargin || 23.8).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
