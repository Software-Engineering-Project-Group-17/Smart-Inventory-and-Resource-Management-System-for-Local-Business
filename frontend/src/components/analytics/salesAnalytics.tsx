// app/(dash)/SalesAnalytics.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Target,
} from "lucide-react";
import { salesAPI, subscribeRealtime } from "@/lib/api/analyticsApi";

// ---------------- Safe mappers (normalize backend shapes) ----------------
const mapDailySales = (arr: any[] = []) =>
  arr.map((d) => ({
    date: d.date || d.day || d.label || "",
    sales: Number(d.sales ?? d.revenue ?? 0),
    orders: Number(d.orders ?? d.count ?? 0),
    avgOrderValue:
      Number(
        d.avgOrderValue ??
          Number(d.sales ?? 0) / Math.max(1, Number(d.orders ?? 0))
      ),
  }));

// Include id, keep label separately
const mapByCategory = (arr: any[] = []) =>
  arr.map((c) => ({
    id: Number(c.id ?? c.category_id ?? c.categoryId ?? NaN),
    category: c.category || c.name || c.label || "—",
    sales: Number(c.sales ?? c.revenue ?? 0),
    orders: Number(c.orders ?? 0),
    growth: Number(c.growth ?? c.mom ?? 0),
  }));

const mapByChannel = (arr: any[] = []) =>
  arr.map((ch, i) => ({
    name: ch.name || ch.channel || `Channel ${i + 1}`,
    value: Number(ch.value ?? ch.share ?? 0), // %
    amount: Number(ch.amount ?? ch.revenue ?? 0),
    color: ch.color || ["#3674B5", "#10B981", "#F59E0B", "#8B5CF6"][i % 4],
  }));

const mapTopPerformers = (arr: any[] = []) =>
  arr.map((p) => ({
    name: p.name || p.employee || "—",
    sales: Number(p.sales ?? p.revenue ?? 0),
    orders: Number(p.orders ?? 0),
    target: Number(p.target ?? 0),
    performance: Number(
      p.performance ?? (p.target ? (Number(p.sales ?? 0) / p.target) * 100 : 0)
    ),
  }));

const mapHourly = (arr: any[] = []) =>
  arr.map((h) => ({
    hour: Number(h.hour ?? h.h ?? 0),
    sales: Number(h.sales ?? h.revenue ?? 0),
    orders: Number(h.orders ?? 0),
  }));

// Optional: metrics + goals from backend
const mapMetrics = (m: any = {}) => ({
  totalSales: Number(m.totalSales ?? m.revenue ?? 0),
  totalOrders: Number(m.totalOrders ?? 0),
  avgOrderValue: Number(
    m.avgOrderValue ??
      Number(m.totalSales ?? 0) / Math.max(1, Number(m.totalOrders ?? 0))
  ),
  conversionRate: Number(m.conversionRate ?? 0),
  weeklyGrowth: Number(m.weeklyGrowth ?? 0),
});

// Align to backend fields: { target, achieved, achievementPercent, remaining }
const mapGoals = (g: any = {}) => ({
  monthlyTarget: Number(g.monthlyTarget ?? g.target ?? 120000),
  targetAchievement: Number(g.targetAchievement ?? g.achievementPercent ?? 0), // %
  achieved: Number(g.achieved ?? 0),
  remaining: Number(g.remaining ?? 0),
});

// ---------------- Component ----------------
export default function SalesAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // store category selection by id
  const [selectedCategory, setSelectedCategory] = useState<"all" | number>(
    "all"
  );

  // dynamic dropdown options: {value,label}
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");

  // Data state
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [salesByChannel, setSalesByChannel] = useState<any[]>([]);
  const [topSalespersons, setTopSalespersons] = useState<any[]>([]);
  const [hourlyPattern, setHourlyPattern] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    weeklyGrowth: 0,
  });
  const [goals, setGoals] = useState<any>({
    monthlyTarget: 120000,
    targetAchievement: 0,
    achieved: 0,
    remaining: 0,
  });

  const periodDays =
    selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;

  // Build common params (send categoryId, not label)
  const params = {
    period: selectedPeriod,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        dailyRes,
        byCatRes,
        byChRes,
        topRes,
        hourlyRes,
        metricsRes,
        goalsRes,
      ] = await Promise.allSettled([
        salesAPI.getDailySales({ ...params }),
        salesAPI.getSalesByCategory({ ...params }),
        // channel accepts params now (so it can respect categoryId)
        salesAPI.getSalesByChannel({ categoryId: params.categoryId }),
        salesAPI.getTopPerformers({ limit: 5, ...params }),
        salesAPI.getHourlyPattern({
          days: Math.min(periodDays, 60),
          categoryId: params.categoryId,
        }),
        // pass categoryId so backend metrics/goals can respect filter
        salesAPI.getMetrics({ categoryId: params.categoryId }),
        salesAPI.getSalesGoals({ categoryId: params.categoryId }),
      ]);

      if (dailyRes.status === "fulfilled") {
        const rows = Array.isArray(dailyRes.value?.data)
          ? dailyRes.value.data
          : dailyRes.value;
        setDailySales(mapDailySales(rows));
      }

      if (byCatRes.status === "fulfilled") {
        const rows = Array.isArray(byCatRes.value?.data)
          ? byCatRes.value.data
          : byCatRes.value;
        const mapped = mapByCategory(rows);
        setSalesByCategory(mapped);

        // build unique category list for dropdown
        const opts = Array.from(
          new Map(
            mapped
              .filter((c) => Number.isFinite(c.id))
              .map((c) => [
                c.id,
                { value: Number(c.id), label: String(c.category) },
              ])
          ).values()
        ).sort((a, b) => a.label.localeCompare(b.label));
        setCategoryOptions(opts);

        // if current selection no longer exists, reset to "all"
        setSelectedCategory((prev) =>
          prev === "all" || opts.some((o) => o.value === prev) ? prev : "all"
        );
      }

      if (byChRes.status === "fulfilled") {
        const rows = Array.isArray(byChRes.value?.data)
          ? byChRes.value.data
          : byChRes.value;
        setSalesByChannel(mapByChannel(rows));
      }

      if (topRes.status === "fulfilled") {
        const rows = Array.isArray(topRes.value?.data)
          ? topRes.value.data
          : topRes.value;
        setTopSalespersons(mapTopPerformers(rows));
      }

      if (hourlyRes.status === "fulfilled") {
        const rows = Array.isArray(hourlyRes.value?.data)
          ? hourlyRes.value.data
          : hourlyRes.value;
        setHourlyPattern(mapHourly(rows));
      }

      if (metricsRes.status === "fulfilled") {
        setMetrics(mapMetrics(metricsRes.value));
      }

      if (goalsRes.status === "fulfilled") {
        setGoals(mapGoals(goalsRes.value));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load sales analytics");
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [selectedPeriod, selectedCategory]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshData = () => fetchAll();

  // -------------------- Realtime (SSE/WS) --------------------
  // Debounce refetches in case multiple topics arrive together.
  const invalidateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const topics = [
      "sales.daily",
      "sales.by-category",
      "sales.by-channel",
      "sales.top-performers",
      "sales.hourly",
      "sales.metrics",
      "sales.goals",
      // a generic invalidation signal you can emit server-side after any write:
      "sales.invalidate",
    ];

    const unsubscribe = subscribeRealtime(topics, (msg: any) => {
      // Optional payload filtering if backend includes period or category in the event:
      try {
        const msgPeriod = msg?.data?.period || msg?.data?.range;
        if (msgPeriod && String(msgPeriod) !== String(selectedPeriod)) return;

        // selectedCategory: "all" | number
        const selCat =
          selectedCategory === "all" ? null : Number(selectedCategory);
        const msgCat = msg?.data?.categoryId ?? msg?.data?.category_id;
        if (
          selCat !== null &&
          selCat !== undefined &&
          Number.isFinite(selCat) &&
          msgCat !== undefined &&
          Number(msgCat) !== Number(selCat)
        ) {
          return;
        }
      } catch {
        // ignore malformed payloads
      }

      if (invalidateTimer.current) clearTimeout(invalidateTimer.current);
      invalidateTimer.current = setTimeout(() => {
        fetchAll();
      }, 300);
    });

    return () => {
      if (invalidateTimer.current) clearTimeout(invalidateTimer.current);
      unsubscribe?.();
    };
  }, [fetchAll, selectedPeriod, selectedCategory]);

  // --------- derived metrics (category-aware) ----------
  const derived = useMemo(() => {
    const totalSales =
      dailySales.reduce((sum, d) => sum + Number(d.sales || 0), 0) ||
      Number(metrics.totalSales || 0);

    const totalOrders =
      dailySales.reduce((sum, d) => sum + Number(d.orders || 0), 0) ||
      Number(metrics.totalOrders || 0);

    const avgOrderValue =
      totalOrders > 0
        ? totalSales / totalOrders
        : Number(metrics.avgOrderValue || 0);

    // weekly growth from last 7 vs prev 7 on filtered data
    const last7 = dailySales.slice(-7);
    const prev7 = dailySales.slice(-14, -7);
    const last7Sales = last7.reduce((s, d) => s + Number(d.sales || 0), 0);
    const prev7Sales = prev7.reduce((s, d) => s + Number(d.sales || 0), 0);
    const weeklyGrowth =
      prev7Sales > 0
        ? ((last7Sales - prev7Sales) / prev7Sales) * 100
        : Number(metrics.weeklyGrowth || 0);

    // MTD from filtered data (dates may be MM/DD; fallback to totalSales)
    const now = new Date();
    let mtd = 0;
    for (const d of dailySales) {
      const dt = d?.date ? new Date(d.date) : (null as any);
      if (
        dt &&
        !isNaN(dt.getTime()) &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear()
      ) {
        mtd += Number(d.sales || 0);
      }
    }
    if (mtd === 0) mtd = totalSales;

    const monthlyTarget = Number(goals.monthlyTarget || 120000);

    // Make goals reflect the filtered MTD, not backend %.
    const achievedAmount = mtd;
    const targetAchievement =
      monthlyTarget > 0 ? (achievedAmount / monthlyTarget) * 100 : 0;

    const remainingAmount = Math.max(0, monthlyTarget - achievedAmount);

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      weeklyGrowth,
      conversionRate: Number(metrics.conversionRate || 0),
      monthlyTarget,
      targetAchievement: Math.max(0, Math.min(targetAchievement, 100)),
      achievedAmount,
      remainingAmount,
    };
  }, [metrics, goals, dailySales]);

  // Use selectedCategory to filter only the bar chart
  const filteredSalesByCategory = useMemo(
    () =>
      selectedCategory === "all"
        ? salesByCategory
        : salesByCategory.filter((c) => c.id === selectedCategory),
    [selectedCategory, salesByCategory]
  );

  // Recompute channel amounts based on filtered totalSales (keeps shares, syncs totals)
  const channelWithAmounts = useMemo(
    () =>
      salesByChannel.map((ch) => ({
        ...ch,
        amount: (Number(ch.value || 0) / 100) * Number(derived.totalSales || 0),
      })),
    [salesByChannel, derived.totalSales]
  );

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    format = "number",
    target,
  }: any) => {
    const isPositive = Number(change ?? 0) >= 0;
    const formattedValue =
      format === "currency"
        ? `$${Number(value || 0).toLocaleString()}`
        : format === "percentage"
        ? `${Number(value || 0).toFixed(1)}%`
        : Number(value || 0).toLocaleString();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + "20" }}>
            <Icon size={24} style={{ color }} />
          </div>
          {target !== undefined && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Target</div>
              <div className="text-sm font-medium">
                {format === "currency" ? `$${Number(target).toLocaleString()}` : target}
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium">
                {Math.abs(Number(change || 0)).toFixed(1)}% vs last week
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---- initial loading screen (before showing actual values) ----
  if (firstLoad && loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="h-5 w-5 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
          <span className="font-medium">Loading sales analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl text-white"
                style={{ backgroundColor: "#10B981" }}
              >
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                <p className="text-gray-600">
                  Track sales performance and identify growth opportunities
                </p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* CATEGORY FILTER — dynamic (id-based) */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedCategory(v === "all" ? "all" : Number(v));
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            title="Total Sales"
            value={derived.totalSales}
            change={derived.weeklyGrowth}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            target={derived.monthlyTarget}
          />
          <MetricCard
            title="Total Orders"
            value={derived.totalOrders}
            change={4.8}
            icon={ShoppingCart}
            color="#3674B5"
            target={1200}
          />
          <MetricCard
            title="Avg Order Value"
            value={derived.avgOrderValue}
            change={2.1}
            icon={Target}
            color="#F59E0B"
            format="currency"
          />
          <MetricCard
            title="Conversion Rate"
            value={derived.conversionRate}
            change={0.5}
            icon={TrendingUp}
            color="#8B5CF6"
            format="percentage"
          />
        </div>

        {/* Sales Trend and Channel Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Daily Sales Trend
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={dailySales.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === "sales")
                      return [`${Number(value).toLocaleString()}`, "Sales"];
                    if (name === "orders") return [value, "Orders"];
                    return [value, name];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  fill="#10B981"
                  fillOpacity={0.1}
                  stroke="#10B981"
                  strokeWidth={2}
                  name="sales"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3674B5"
                  strokeWidth={2}
                  dot={{ fill: "#3674B5", strokeWidth: 2, r: 4 }}
                  name="orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Sales by Channel
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={channelWithAmounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelWithAmounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === "value") return [`${value}%`, "Share"];
                    if (name === "amount")
                      return [`$${Number(value).toLocaleString()}`, "Amount"];
                    return [value, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {channelWithAmounts.map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-sm text-gray-600">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${Number(channel.amount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Number(channel.value || 0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance and Top Salespersons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Sales by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredSalesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="category"
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${Number(value).toLocaleString()}`,
                    "Sales",
                  ]}
                />
                <Bar dataKey="sales" fill="#3674B5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Sales Performers
            </h3>
            <div className="space-y-4">
              {topSalespersons.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{person.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>${Number(person.sales || 0).toLocaleString()}</span>
                      <span>{Number(person.orders || 0)} orders</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        Number(person.performance) >= 85
                          ? "text-green-600"
                          : Number(person.performance) >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {Number(person.performance || 0).toFixed(1)}%
                    </div>
                    {person.target ? (
                      <div className="text-xs text-gray-500">
                        Target: ${Number(person.target).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {topSalespersons.length === 0 && (
                <p className="text-sm text-gray-500">No performers found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Hourly Sales Pattern */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Hourly Sales Pattern
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hour"
                stroke="#6b7280"
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value: any) => [
                  `${Number(value).toLocaleString()}`,
                  "Sales",
                ]}
                labelFormatter={(hour: any) =>
                  `${hour}:00 - ${Number(hour) + 1}:00`
                }
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Goals
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Target</span>
                  <span>{derived.targetAchievement.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(derived.targetAchievement, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Target: ${Number(derived.monthlyTarget).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Achieved (MTD): ${Number(derived.achievedAmount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: ${Number(derived.remainingAmount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Key Insights
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">
                  Peak sales hours often cluster midday.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">
                  Top categories show positive MoM growth.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">
                  Online channel typically leads share.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">
                  Average order value stable to slightly up.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommendations
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Optimize Peak Hours
                </p>
                <p className="text-xs text-blue-600">
                  Staff up during highest-order windows.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Double Down on Winners
                </p>
                <p className="text-xs text-green-600">
                  Promote categories with strong growth.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  Strengthen Lower Channels
                </p>
                <p className="text-xs text-yellow-600">
                  Run targeted campaigns for underperforming channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
