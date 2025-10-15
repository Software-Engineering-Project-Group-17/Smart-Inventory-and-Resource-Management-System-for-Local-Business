"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  BarChart as RBarChart,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Target,
  Heart,
  Award,
} from "lucide-react";
import { customerAPI, subscribeRealtime } from "@/lib/api/analyticsApi";

// --- Color helpers (consistent with your design palette) ---
const SEGMENT_COLORS = [
  "#8B5CF6",
  "#3674B5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#0EA5E9",
];

// Type definitions for data mapping
interface RawSegment {
  segment?: string;
  name?: string;
  count?: number;
  customers?: number;
  revenue?: number;
  avgOrderValue?: number;
  aov?: number;
}

interface RawAcquisition {
  month?: string;
  label?: string;
  date?: string;
  newCustomers?: number;
  new?: number;
  returningCustomers?: number;
  returning?: number;
  churnedCustomers?: number;
  churned?: number;
}

interface RawDemographic {
  ageGroup?: string;
  group?: string;
  label?: string;
  customers?: number;
  count?: number;
  percentage?: number;
  percent?: number;
  spending?: number;
}

interface RawBehavior {
  behavior?: string;
  metric?: string;
  name?: string;
  score?: number;
  value?: number;
}

interface RawCustomer {
  name?: string;
  customerName?: string;
  totalSpent?: number;
  revenue?: number;
  orders?: number;
  totalOrders?: number;
  avgOrder?: number;
  avgOrderValue?: number;
  lastPurchase?: string;
  lastSeen?: string;
  segment?: string;
  tier?: string;
}

interface RawRetention {
  cohort?: string;
  label?: string;
  retention?: number;
  rate?: number;
}

// --- Safe mappers (tolerate minor shape differences from backend) ---
const mapSegments = (arr: RawSegment[] = []) =>
  arr.map((s, idx) => ({
    segment: s.segment || s.name || `Segment ${idx + 1}`,
    count: Number(s.count ?? s.customers ?? 0),
    revenue: Number(s.revenue ?? 0),
    avgOrderValue: Number(s.avgOrderValue ?? s.aov ?? 0),
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

const mapAcquisition = (arr: RawAcquisition[] = []) =>
  arr.map((m) => ({
    month: m.month || m.label || m.date || "",
    newCustomers: Number(m.newCustomers ?? m.new ?? 0),
    returningCustomers: Number(m.returningCustomers ?? m.returning ?? 0),
    churnedCustomers: Number(m.churnedCustomers ?? m.churned ?? 0),
  }));

const mapDemographics = (arr: RawDemographic[] = []) =>
  arr.map((d) => ({
    ageGroup: d.ageGroup || d.group || d.label || "",
    customers: Number(d.customers ?? d.count ?? 0),
    percentage: Number(d.percentage ?? d.percent ?? 0),
    spending: Number(d.spending ?? 0),
  }));

const mapBehavior = (arr: RawBehavior[] = []) =>
  arr.map((b) => ({
    behavior: b.behavior || b.metric || b.name || "",
    score: Number(b.score ?? b.value ?? 0),
  }));

const mapTopCustomers = (arr: RawCustomer[] = []) =>
  arr.map((c) => ({
    name: c.name || c.customerName || "—",
    totalSpent: Number(c.totalSpent ?? c.revenue ?? 0),
    orders: Number(c.orders ?? c.totalOrders ?? 0),
    avgOrder: Number(c.avgOrder ?? c.avgOrderValue ?? 0),
    lastPurchase: c.lastPurchase || c.lastSeen || "—",
    segment: c.segment || c.tier || "—",
  }));

const mapRetention = (arr: RawRetention[] = []) =>
  arr.map((r, idx) => ({
    cohort: r.cohort || r.label || `Month ${idx + 1}`,
    retention: Number(r.retention ?? r.rate ?? 0),
  }));

const AcquisitionTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload || {};
  const newC = Number(row.newCustomers ?? row.new ?? 0);
  const retC = Number(row.returningCustomers ?? row.returning ?? 0);
  return (
    <div className="bg-white border rounded-md p-2 shadow-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-sm text-green-600">New Customers : {newC}</div>
      <div className="text-sm text-blue-600">Returning Customers : {retC}</div>
    </div>
  );
};

const DemographicsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload || {};
  return (
    <div className="bg-white border rounded-md p-2 shadow-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-700">Customers: {Number(row.customers || 0)}</div>
      <div className="text-sm text-gray-700">Share: {Number(row.percentage || 0)}%</div>
      <div className="text-sm text-gray-700">
        Spending: ${Number(row.spending || 0).toLocaleString()}
      </div>
    </div>
  );
};

export default function CustomerAnalytics() {
  // Filters (extend with branchId when you have multi-branch UI)
  const [selectedPeriod, setSelectedPeriod] = useState("12m");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");

  // Data state
  const [segments, setSegments] = useState<any[]>([]);
  const [acquisition, setAcquisition] = useState<any[]>([]);
  const [demographics, setDemographics] = useState<any[]>([]);
  const [behavior, setBehavior] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [retention, setRetention] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalCustomers: 0,
    totalRevenue: 0,
    avgCustomerValue: 0,
    retentionRate: 0,
    customerGrowth: 0,
    vipRevenue: 0,
  });

  // Fetch all sections
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        segmentsRes,
        acquisitionRes,
        demographicsRes,
        behaviorRes,
        topRes,
        retentionRes,
        metricsRes,
      ] = await Promise.allSettled([
        customerAPI.getSegments(), // GET /api/customers/segments
        customerAPI.getAcquisition({ period: selectedPeriod }), // GET /api/customers/acquisition?period=12m
        customerAPI.getDemographics(), // GET /api/customers/demographics
        customerAPI.getBehavior(), // GET /api/customers/behavior
        customerAPI.getTopCustomers({ limit: 5 }), // GET /api/customers/top-customers?limit=5
        customerAPI.getRetention(), // GET /api/customers/retention
        customerAPI.getMetrics(), // GET /api/customers/metrics
      ]);

      if (segmentsRes.status === "fulfilled")
        setSegments(
          mapSegments(segmentsRes.value?.segments || segmentsRes.value)
        );
      if (acquisitionRes.status === "fulfilled")
        setAcquisition(
          mapAcquisition(acquisitionRes.value?.data || acquisitionRes.value)
        );
      if (demographicsRes.status === "fulfilled")
        setDemographics(
          mapDemographics(
            demographicsRes.value?.ageDistribution || demographicsRes.value
          )
        );
      if (behaviorRes.status === "fulfilled")
        setBehavior(
          mapBehavior(behaviorRes.value?.profile || behaviorRes.value)
        );
      if (topRes.status === "fulfilled")
        setTopCustomers(
          mapTopCustomers(topRes.value?.customers || topRes.value)
        );
      if (retentionRes.status === "fulfilled")
        setRetention(
          mapRetention(retentionRes.value?.cohorts || retentionRes.value)
        );
      if (metricsRes.status === "fulfilled") {
        const m = metricsRes.value || {};
        setMetrics({
          totalCustomers: Number(m.totalCustomers ?? 0),
          totalRevenue: Number(m.totalRevenue ?? 0),
          avgCustomerValue: Number(m.avgCustomerValue ?? m.acv ?? 0),
          retentionRate: Number(m.retentionRate ?? 0),
          customerGrowth: Number(m.customerGrowth ?? m.growth ?? 0),
          vipRevenue: Number(m.vipRevenue ?? 0),
        });
      }

      // Fallbacks if backend doesn’t send metrics
      if (metricsRes.status !== "fulfilled") {
        const totals = segments.reduce(
          (acc, s) => {
            acc.customers += Number(s.count ?? 0);
            acc.revenue += Number(s.revenue ?? 0);
            return acc;
          },
          { customers: 0, revenue: 0 }
        );
        const churned = acquisition.reduce(
          (a, m) => a + Number(m.churnedCustomers ?? 0),
          0
        );
        const retentionRate =
          totals.customers > 0
            ? ((totals.customers - churned) / totals.customers) * 100
            : 0;
        setMetrics((prev: any) => ({
          ...prev,
          totalCustomers: totals.customers,
          totalRevenue: totals.revenue,
          avgCustomerValue: totals.customers
            ? totals.revenue / totals.customers
            : 0,
          retentionRate,
        }));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load customer analytics");
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [selectedPeriod]);

  // Initial & refetch on period change
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshData = () => fetchAll();

  // -------------------- Realtime (SSE/WS) --------------------
  // The backend should emit messages to any of these topics whenever underlying
  // customer data changes. On receipt we debounce and refetch.
  const invalidateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const topics = [
      "customers.segments",
      "customers.acquisition",
      "customers.demographics",
      "customers.behavior",
      "customers.top-customers",
      "customers.retention",
      "customers.metrics",
      // generic cache-buster/refresh signal:
      "customers.invalidate",
    ];

    const unsubscribe = subscribeRealtime(topics, (msg: any) => {
      // Optional filters if your backend includes them in the payload:
      try {
        const msgPeriod = msg?.data?.period;
        if (msgPeriod && String(msgPeriod) !== String(selectedPeriod)) return;

        const msgSegment = (msg?.data?.segment ?? msg?.data?.tier)?.toString()?.toLowerCase?.();
        if (selectedSegment !== "all" && msgSegment && msgSegment !== selectedSegment.toLowerCase()) {
          return;
        }
      } catch {
        // ignore if payload not structured
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
  }, [fetchAll, selectedPeriod, selectedSegment]);

  // Derived metric cards (use backend metrics when available)
  const customerMetrics = useMemo(() => {
    return {
      totalCustomers:
        metrics.totalCustomers ||
        segments.reduce((s, seg) => s + (seg.count || 0), 0),
      totalRevenue:
        metrics.totalRevenue ||
        segments.reduce((s, seg) => s + (seg.revenue || 0), 0),
      avgCustomerValue:
        metrics.avgCustomerValue ||
        segments.reduce((s, seg) => s + (seg.revenue || 0), 0) /
          Math.max(
            1,
            segments.reduce((s, seg) => s + (seg.count || 0), 0)
          ),
      retentionRate: metrics.retentionRate || 0,
      customerGrowth: metrics.customerGrowth ?? 0,
    };
  }, [metrics, segments]);

  interface MetricCardProps {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
    format?: "number" | "currency" | "percentage";
    subtitle?: string;
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    format = "number",
    subtitle,
  }: MetricCardProps) => {
    const isPositive = (change ?? 0) >= 0;
    const formattedValue =
      format === "currency"
        ? `$${Number(value || 0).toLocaleString()}`
        : format === "percentage"
        ? `${Number(value || 0).toFixed(1)}%`
        : Number(value || 0).toLocaleString();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: color + "20" }}
          >
            <Icon size={24} style={{ color }} />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="text-sm font-medium">
                {Math.abs(Number(change || 0)).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  // ---- initial loading screen (before showing actual values) ----
  if (firstLoad && loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="h-5 w-5 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin" />
          <span className="font-medium">Loading customer analytics…</span>
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
                style={{ backgroundColor: "#F59E0B" }}
              >
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Customer Analytics
                </h1>
                <p className="text-gray-600">
                  Understand customer behavior, segments, and lifetime value
                </p>
                {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Segments</option>
                <option value="vip">VIP Customers</option>
                <option value="regular">Regular Customers</option>
                <option value="occasional">Occasional Buyers</option>
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Customers"
            value={customerMetrics.totalCustomers}
            change={metrics.customerGrowth ?? 0}
            icon={Users}
            color="#F59E0B"
            subtitle="Active customer base"
          />
          <MetricCard
            title="Customer Revenue"
            value={customerMetrics.totalRevenue}
            change={metrics.revenueGrowth ?? 12.3}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            subtitle="Total customer value"
          />
          <MetricCard
            title="Avg Customer Value"
            value={customerMetrics.avgCustomerValue}
            change={metrics.acvGrowth ?? 5.7}
            icon={Target}
            color="#3674B5"
            format="currency"
            subtitle="Revenue per customer"
          />
          <MetricCard
            title="Retention Rate"
            value={customerMetrics.retentionRate}
            change={metrics.retentionGrowth ?? 2.1}
            icon={Heart}
            color="#8B5CF6"
            format="percentage"
            subtitle="Customer loyalty score"
          />
        </div>

        {/* Customer Segments + Acquisition */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Segments
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {segments.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.color ||
                        SEGMENT_COLORS[index % SEGMENT_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value as any, "Customers"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {segments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          segment.color ||
                          SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                      }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {segment.segment}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {segment.count?.toLocaleString?.() ?? segment.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Acquisition Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={acquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<AcquisitionTooltip />} />
                <Area
                  type="monotone"
                  dataKey="newCustomers"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="New Customers"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="returningCustomers"
                  stackId="1"
                  stroke="#3674B5"
                  fill="#3674B5"
                  fillOpacity={0.8}
                  name="Returning Customers"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics + Behavior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Demographics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RBarChart data={demographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" domain={[0, "dataMax + 1"]} />
                <YAxis dataKey="ageGroup" type="category" stroke="#6b7280" width={60} />
                <Tooltip />
                <Bar dataKey="customers" fill="#F59E0B" name="Customers" barSize={18} />
              </RBarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Behavior Profile
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={behavior}>
                <PolarGrid />
                <PolarAngleAxis dataKey="behavior" className="text-xs" />
                <PolarRadiusAxis angle={60} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers + Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Customers
            </h3>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {customer.name
                          .toString()
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{customer.orders} orders</span>
                        <span>
                          Avg: $
                          {Number(customer.avgOrder || 0).toLocaleString()}
                        </span>
                        <span>Last: {customer.lastPurchase}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${Number(customer.totalSpent || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Award size={12} className="text-purple-600" />
                      <span className="text-xs text-purple-600">
                        {customer.segment}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <p className="text-sm text-gray-500">No top customers found.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Retention Cohort
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="cohort" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${Number(value).toFixed(1)}%`,
                    "Retention Rate",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Optional quick summary, can be replaced with backend-provided summaries */}
            <div className="mt-4 space-y-2">
              {retention.slice(0, 1).map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">1-Month Retention</span>
                  <span className="font-medium">
                    {typeof r.retention === "number"
                      ? `${r.retention.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
              ))}
              {retention.slice(5, 6).map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">6-Month Retention</span>
                  <span className="font-medium">
                    {typeof r.retention === "number"
                      ? `${r.retention.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
              ))}
              {/* If your backend provides 12m directly, replace this with that item */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">12-Month Retention</span>
                <span className="font-medium">
                  {retention.length >= 12 &&
                  typeof retention[11].retention === "number"
                    ? `${retention[11].retention.toFixed(1)}%`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
