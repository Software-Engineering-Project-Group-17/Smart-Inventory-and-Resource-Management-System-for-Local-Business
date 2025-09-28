"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
} from "lucide-react";

type AnalyticsId = "overview" | "sales" | "inventory" | "customers";

const analyticsRoute: Record<AnalyticsId, string> = {
  overview: "/analytics/overview",
  sales: "/analytics/sales",
  inventory: "/analytics/inventory",
  customers: "/analytics/customers",
};

// locale-safe formatters
const fmtNumber = (n: number) => n.toLocaleString("en-US");
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AnalyticsNavigation() {
  const router = useRouter();
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 445000,
    totalOrders: 1240,
    totalCustomers: 2527,
    inventoryItems: 2620,
    growthRate: 8.5,
    loading: false,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setQuickStats((s) => ({
        ...s,
        totalRevenue: s.totalRevenue + Math.floor(Math.random() * 40),
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const navigateById = (id: AnalyticsId) => {
    router.push(analyticsRoute[id] ?? "/analytics");
  };

  const analyticsModules = [
    {
      id: "overview",
      title: "Business Overview",
      description:
        "Comprehensive dashboard with key performance indicators and business metrics",
      icon: BarChart3,
      color: "#3674B5",
      features: ["Revenue tracking", "Order analytics", "Customer insights", "Performance KPIs"],
      metrics: {
        primary: fmtUSD(quickStats.totalRevenue),
        primaryLabel: "Total Revenue",
        secondary: "+8.5%",
        secondaryLabel: "Growth Rate",
      },
    },
    {
      id: "sales",
      title: "Sales Analytics",
      description:
        "Track sales performance, identify trends, and optimize revenue generation",
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
      id: "inventory",
      title: "Inventory Analytics",
      description:
        "Monitor stock levels, turnover rates, and inventory optimization opportunities",
      icon: Package,
      color: "#8B5CF6",
      features: ["Stock monitoring", "Turnover analysis", "Reorder alerts", "Warehouse utilization"],
      metrics: {
        primary: fmtNumber(quickStats.inventoryItems),
        primaryLabel: "Items in Stock",
        secondary: "85%",
        secondaryLabel: "Stock Health",
      },
    },
    {
      id: "customers",
      title: "Customer Analytics",
      description:
        "Understand customer behavior, segments, and lifetime value patterns",
      icon: Users,
      color: "#F59E0B",
      features: ["Customer segmentation", "Retention analysis", "Behavior tracking", "Lifetime value"],
      metrics: {
        primary: fmtNumber(quickStats.totalCustomers),
        primaryLabel: "Active Customers",
        secondary: "84%",
        secondaryLabel: "Retention Rate",
      },
    },
  ] as const;

  const quickInsights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Revenue Target Achieved",
      message: "Monthly revenue target exceeded by 12%",
      action: "View Sales Analytics",
      goto: "sales" as AnalyticsId,
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Low Stock Alert",
      message: "23 items below restock threshold",
      action: "View Inventory Analytics",
      goto: "inventory" as AnalyticsId,
    },
    {
      type: "info",
      icon: TrendingUp,
      title: "Customer Growth",
      message: "New customer acquisition up 15% this month",
      action: "View Customer Analytics",
      goto: "customers" as AnalyticsId,
    },
  ] as const;

  const getInsightColor = (type: "success" | "warning" | "info" | string) => {
    switch (type) {
      case "success":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" };
      case "warning":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "text-yellow-600" };
      case "info":
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "text-blue-600" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: "text-gray-600" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics Hub</h1>
              <p className="text-gray-600">Comprehensive insights and data visualization for informed decision making</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Access real-time analytics across sales, inventory, customers, and business performance
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50">
            <Calendar size={18} />
            <span className="text-sm font-medium text-gray-700">This Month</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50">
            <Filter size={18} />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </button>
          <div className="sm:ml-auto text-sm text-gray-500 inline-flex items-center gap-2">
            <Clock size={16} /> Updated just now
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{fmtUSD(quickStats.totalRevenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+{quickStats.growthRate}% vs last month</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.totalOrders)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-blue-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+12.3% MoM</span>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.totalCustomers)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-yellow-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+15% new this month</span>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Items in Stock</p>
                <p className="text-2xl font-bold text-gray-900">{fmtNumber(quickStats.inventoryItems)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-purple-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">85% stock health</span>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {quickInsights.map((ins, idx) => {
            const C = ins.icon;
            const c = getInsightColor(ins.type);
            return (
              <div key={idx} className={`border ${c.border} ${c.bg} rounded-xl p-4 flex items-start gap-3`}>
                <div className={`p-2 rounded-lg ${c.icon} bg-white/70 border ${c.border}`}>
                  <C size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${c.text}`}>{ins.title}</p>
                  <p className="text-sm text-gray-600">{ins.message}</p>
                  <button
                    onClick={() => navigateById(ins.goto)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {ins.action} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Modules */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {analyticsModules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl text-white shrink-0" style={{ backgroundColor: m.color }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{m.title}</h3>
                        <p className="text-sm text-gray-600">{m.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{m.metrics.primaryLabel}</p>
                        <p className="text-lg font-bold text-gray-900">{m.metrics.primary}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{m.metrics.secondaryLabel}</p>
                        <p className="text-lg font-semibold text-gray-900">{m.metrics.secondary}</p>
                      </div>
                    </div>

                    <ul className="mt-4 grid grid-cols-2 gap-2">
                      {m.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      onClick={() => navigateById(m.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-800"
                    >
                      Open Module <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 mt-8">
          <p>© {new Date().getFullYear()} Business Analytics Hub · Demo UI</p>
        </div>
      </div>
    </div>
  );
}
