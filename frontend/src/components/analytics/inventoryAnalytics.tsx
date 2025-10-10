"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, PieChart, Pie, Cell
} from "recharts";
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, RefreshCw, Activity
} from "lucide-react";
import { inventoryAPI } from "@/lib/api/analyticsApi";

// ---------- Safe mappers ----------
const mapCategories = (arr: any[] = []) =>
  arr.map((c) => ({
    category: c.category || c.name || c.label || "—",
    stock: Number(c.stock ?? c.inStock ?? 0),
    lowStock: Number(c.lowStock ?? c.low ?? 0),
    outOfStock: Number(c.outOfStock ?? c.oos ?? 0),
    value: Number(c.value ?? c.inventoryValue ?? 0),
    turnover: Number(c.turnover ?? c.turnoverRate ?? 0),
    trend: Number(c.trend ?? c.mom ?? 0),
  }));

// --- types for stock pie parts ---
type StockPart = {
  name: string;
  value: number; // percentage
  count: number; // absolute count
  color: string;
};

// ensure % sum == 100 (fix rounding drift) and preserve object shape
function normalizePercents<T extends { value: number }>(parts: T[]): T[] {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 100) return parts;
  const diff = 100 - total;
  const idx = parts.reduce((maxI, p, i, a) => (p.value > a[maxI].value ? i : maxI), 0);
  const copy = parts.slice();
  copy[idx] = { ...copy[idx], value: copy[idx].value + diff };
  return copy;
}

const mapStockLevels = (obj: any = {}): StockPart[] => {
  if (Array.isArray(obj)) return obj as StockPart[];
  const inStock = Number(obj.inStock ?? obj.in_stock ?? 0);
  const lowStock = Number(obj.lowStock ?? obj.low_stock ?? 0);
  const outOfStock = Number(obj.outOfStock ?? obj.out_of_stock ?? 0);
  const denom = inStock + lowStock + outOfStock || 1;

  let parts: StockPart[] = [
    { name: "In Stock", value: Math.round((inStock / denom) * 100), count: inStock, color: "#10B981" },
    { name: "Low Stock", value: Math.round((lowStock / denom) * 100), count: lowStock, color: "#F59E0B" },
    { name: "Out of Stock", value: Math.round((outOfStock / denom) * 100), count: outOfStock, color: "#EF4444" },
  ];

  parts = normalizePercents(parts);
  return parts;
};

const mapMovement = (arr: any[] = []) =>
  arr.map((m) => ({
    month: m.month || m.label || m.date || "",
    inbound: Number(m.inbound ?? m.in ?? 0),
    outbound: Number(m.outbound ?? m.out ?? 0),
    net: Number(
      m.net ??
        ((m.inbound ?? m.in ?? 0) - (m.outbound ?? m.out ?? 0))
    ),
  }));

const mapTopMoving = (arr: any[] = []) =>
  arr.map((t) => ({
    name: t.name || t.item || "—",
    movement: Number(t.movement ?? t.units ?? t.qty ?? 0),
    category: t.category || t.group || "—",
    status: t.status || t.velocityBand || "Medium",
    velocity: Number(t.velocity ?? t.rate ?? 0),
  }));

type WarehouseRaw = {
  id?: string | number;
  branchId?: string | number;
  branch_id?: string | number;
  warehouse_id?: string | number;
  identifier?: string | number;
  code?: string | number;
  slug?: string | number;
  key?: string | number;
  name?: string;
  warehouse?: string;
  capacity?: number;
  used?: number;
  utilized?: number;
  utilization?: number;
};

// Returns a real backend id if present (NO name fallback here)
const extractQueryId = (w: WarehouseRaw): string | null => {
  const id =
    w.id ??
    w.branchId ??
    w.branch_id ??
    w.warehouse_id ??
    w.identifier ??
    w.code ??
    w.slug ??
    w.key ??
    null;
  if (id === null || id === undefined) return null;
  const s = String(id).trim();
  return s.length ? s : null;
};

// For display we can fall back to name so dropdown shows everything
const displayIdOrName = (w: WarehouseRaw): string => {
  const qid = extractQueryId(w);
  if (qid) return qid;
  return String(w.warehouse || w.name || "—");
};

const mapWarehouses = (arr: any[] = []) =>
  arr.map((w: WarehouseRaw) => ({
    warehouse: (w.warehouse || w.name || "—") as string,
    capacity: Number(w.capacity ?? 0),
    used: Number(w.used ?? w.utilized ?? 0),
    utilization: Number(
      w.utilization ?? (w.capacity ? (Number(w.used ?? 0) / Number(w.capacity)) * 100 : 0)
    ),
    __displayId: displayIdOrName(w),   // used as the <option value>
    __queryId: extractQueryId(w),      // only sent to backend if present
  }));

const mapReorderAlerts = (arr: any[] = []) =>
  arr.map((r) => ({
    item: r.item || r.name || "—",
    currentStock: Number(r.currentStock ?? r.current_stock ?? r.stock ?? r.current ?? 0),
    reorderPoint: Number(r.reorderPoint ?? r.reorder_point ?? r.threshold ?? r.reorder ?? 0),
    supplier: r.supplier || r.vendor || "—",
    urgency: String(r.urgency ?? r.priority ?? "medium").toLowerCase(),
  }));

export default function InventoryAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<"3m" | "6m" | "12m">("12m");

  // stores the option value (real id if available, else name)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");

  // dropdown options with both display id and queryId
  const [branchOptions, setBranchOptions] = useState<Array<{ id: string; name: string; queryId?: string }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data state
  const [categoryOverview, setCategoryOverview] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<StockPart[]>([]);
  const [monthlyMovement, setMonthlyMovement] = useState<any[]>([]);
  const [topMovingItems, setTopMovingItems] = useState<any[]>([]);
  const [warehouseUtilization, setWarehouseUtilization] = useState<any[]>([]);
  const [reorderAlerts, setReorderAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalValue: 0,
    avgTurnover: 0,
    totalStock: 0,
    totalLowStock: 0,
    totalOutOfStock: 0,
  });

  // Only send branchId when we have a real backend id
  const selectedOpt = branchOptions.find(o => o.id === selectedWarehouse);
  const branchId: string | undefined =
    selectedWarehouse === "all" ? undefined : (selectedOpt?.queryId || undefined);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        byCategoryRes,
        stockLevelsRes,
        movementRes,
        topMovingRes,
        warehouseRes,
        reorderRes,
        metricsRes,
      ] = await Promise.allSettled([
        inventoryAPI.getByCategory(branchId),
        inventoryAPI.getStockLevels(branchId),
        inventoryAPI.getMovement({ period: selectedPeriod, branchId }),
        inventoryAPI.getTopMoving({ limit: 5, period: selectedPeriod, branchId }),
        inventoryAPI.getWarehouseUtilization(branchId),
        inventoryAPI.getReorderAlerts(branchId),
        inventoryAPI.getMetrics(branchId),
      ]);

      if (byCategoryRes.status === "fulfilled") {
        const items = Array.isArray(byCategoryRes.value?.data) ? byCategoryRes.value.data : byCategoryRes.value;
        setCategoryOverview(mapCategories(items));
      }

      if (stockLevelsRes.status === "fulfilled") {
        setStockLevels(mapStockLevels(stockLevelsRes.value?.data ?? stockLevelsRes.value));
      }

      if (movementRes.status === "fulfilled") {
        const items = Array.isArray(movementRes.value?.data) ? movementRes.value.data : movementRes.value;
        setMonthlyMovement(mapMovement(items));
      }

      if (topMovingRes.status === "fulfilled") {
        const items = Array.isArray(topMovingRes.value?.data) ? topMovingRes.value.data : topMovingRes.value;
        setTopMovingItems(mapTopMoving(items));
      }

      if (warehouseRes.status === "fulfilled") {
        const raw = Array.isArray(warehouseRes.value?.data) ? warehouseRes.value.data : warehouseRes.value;
        const mapped = mapWarehouses(raw);

        // card data
        setWarehouseUtilization(mapped.map(({ __displayId, __queryId, ...rest }) => rest));

        // dropdown options (show all; only some have queryId)
        const opts = mapped.map((w, i) => ({
          id: String(w.__displayId),
          name: String(w.warehouse || `Warehouse ${i + 1}`),
          queryId: w.__queryId || undefined,
        }));

        // de-dupe by id
        const seen = new Set<string>();
        const dedup = opts.filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)));
        setBranchOptions(dedup);

        // keep selection valid
        if (selectedWarehouse !== "all" && !dedup.some((o) => o.id === selectedWarehouse)) {
          setSelectedWarehouse("all");
        }
      }

      if (reorderRes.status === "fulfilled") {
        const items = Array.isArray(reorderRes.value?.data) ? reorderRes.value.data : reorderRes.value;
        setReorderAlerts(mapReorderAlerts(items));
      }

      if (metricsRes.status === "fulfilled") {
        const m = (metricsRes as any).value || {};
        setMetrics({
          totalValue: Number(m.totalValue ?? m.inventoryValue ?? 0),
          avgTurnover: Number(m.avgTurnover ?? m.turnover ?? 0),
          totalStock: Number(m.totalStock ?? m.inStock ?? 0),
          totalLowStock: Number(m.totalLowStock ?? m.lowStock ?? 0),
          totalOutOfStock: Number(m.totalOutOfStock ?? m.outOfStock ?? 0),
        });
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load inventory analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, branchId, selectedWarehouse]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshData = () => fetchAll();

  const inventoryMetrics = useMemo(() => {
    const totals = {
      totalStock:
        metrics.totalStock ||
        categoryOverview.reduce((sum, cat) => sum + Number(cat.stock || 0), 0),
      totalLowStock:
        metrics.totalLowStock ||
        categoryOverview.reduce((sum, cat) => sum + Number(cat.lowStock || 0), 0),
      totalOutOfStock:
        metrics.totalOutOfStock ||
        categoryOverview.reduce((sum, cat) => sum + Number(cat.outOfStock || 0), 0),
      totalValue:
        metrics.totalValue ||
        categoryOverview.reduce((sum, cat) => sum + Number(cat.value || 0), 0),
      avgTurnover:
        metrics.avgTurnover ||
        (categoryOverview.length
          ? categoryOverview.reduce((sum, cat) => sum + Number(cat.turnover || 0), 0) /
            categoryOverview.length
          : 0),
    };
    const stockHealthScore =
      totals.totalStock > 0
        ? ((totals.totalStock - totals.totalLowStock - totals.totalOutOfStock) / totals.totalStock) * 100
        : 0;

    return {
      ...totals,
      stockHealthScore,
      criticalItems: totals.totalOutOfStock + totals.totalLowStock,
    };
  }, [metrics, categoryOverview]);

  const MetricCard = ({ title, value, change, icon: Icon, color, format = "number", status }: any) => {
    const formattedValue =
      format === "currency"
        ? `$${Number(value || 0).toLocaleString()}`
        : format === "percentage"
        ? `${Number(value || 0).toFixed(1)}%`
        : format === "decimal"
        ? Number(value || 0).toFixed(1)
        : Number(value || 0).toLocaleString();
    const statusColor =
      status === "good" ? "text-green-600" : status === "warning" ? "text-yellow-600" : "text-red-600";

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + "20" }}>
            <Icon size={24} style={{ color }} />
          </div>
          {status && (
            <div className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${statusColor}`}>
              {status === "good" ? "Healthy" : status === "warning" ? "Attention" : "Critical"}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${Number(change) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {Number(change) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium">{Math.abs(Number(change)).toFixed(1)}% vs last month</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "high":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch ((urgency || "").toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
                <p className="text-gray-600">Monitor stock levels, turnover rates, and inventory health</p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dynamic branches */}
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Warehouses</option>
                {branchOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.queryId ? "" : " (no ID)"}{/* optional hint; remove if undesired */}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
            title="Total Items"
            value={inventoryMetrics.totalStock}
            change={3.2}
            icon={Package}
            color="#8B5CF6"
            status={inventoryMetrics.totalStock > 0 ? "good" : "warning"}
          />
          <MetricCard
            title="Inventory Value"
            value={inventoryMetrics.totalValue}
            change={5.8}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            status="good"
          />
          <MetricCard
            title="Stock Health Score"
            value={inventoryMetrics.stockHealthScore}
            change={-1.2}
            icon={Activity}
            color="#F59E0B"
            format="percentage"
            status={
              inventoryMetrics.stockHealthScore >= 80
                ? "good"
                : inventoryMetrics.stockHealthScore >= 60
                ? "warning"
                : "critical"
            }
          />
          <MetricCard
            title="Avg Turnover Rate"
            value={inventoryMetrics.avgTurnover}
            change={2.1}
            icon={TrendingUp}
            color="#3674B5"
            format="decimal"
            status="good"
          />
        </div>

        {/* Stock Distribution + Movement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Level Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stockLevels} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {stockLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {stockLevels.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                    <span className="text-sm text-gray-600">{level.name}</span>
                  </div>
                  <span className="text-sm font-medium">{Number(level.count || 0).toLocaleString()} items</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Inventory Movement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyMovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="inbound" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} name="Inbound" />
                <Area type="monotone" dataKey="outbound" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} name="Outbound" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance + Warehouse Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="stock" fill="#8B5CF6" name="In Stock" radius={[2, 2, 0, 0]} />
                <Bar dataKey="lowStock" fill="#F59E0B" name="Low Stock" radius={[2, 2, 0, 0]} />
                <Bar dataKey="outOfStock" fill="#EF4444" name="Out of Stock" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Warehouse Utilization</h3>
            <div className="space-y-4">
              {warehouseUtilization.map((warehouse, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{warehouse.warehouse}</span>
                    <span className="text-sm text-gray-600">{Number(warehouse.utilization || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Number(warehouse.utilization) >= 90
                          ? "bg-red-500"
                          : Number(warehouse.utilization) >= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Number(warehouse.utilization || 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Used: {Number(warehouse.used || 0).toLocaleString()}</span>
                    <span>Capacity: {Number(warehouse.capacity || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {warehouseUtilization.length === 0 && <p className="text-sm text-gray-500">No data.</p>}
            </div>
          </div>
        </div>

        {/* Top Moving Items + Reorder Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Moving Items</h3>
            <div className="space-y-4">
              {topMovingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{item.category}</span>
                      <span>{Number(item.movement || 0)} units/month</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-sm font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Velocity: {Number(item.velocity || 0)}%</div>
                  </div>
                </div>
              ))}
              {topMovingItems.length === 0 && <p className="text-sm text-gray-500">No top moving items.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reorder Alerts</h3>
            <div className="space-y-4">
              {reorderAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.item}</p>
                    <div className="text-sm text-gray-600">
                      <span>Stock: {Number(alert.currentStock || 0)} | </span>
                      <span>Reorder: {Number(alert.reorderPoint || 0)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{alert.supplier}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getUrgencyColor(alert.urgency) }}
                    >
                      {`${alert.urgency}`.charAt(0).toUpperCase() + `${alert.urgency}`.slice(1)}
                    </div>
                    {`${alert.urgency}`.toLowerCase() === "high" && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle size={12} className="text-red-500" />
                        <span className="text-xs text-red-600">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {reorderAlerts.length === 0 && <p className="text-sm text-gray-500">No alerts 🎉</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
