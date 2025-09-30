"use client";
import dynamic from "next/dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Truck,
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

export default function ReportsDashboard() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Centralized route map -> update these to match your app routes
  const reportRoute: Record<string, string> = {
    "customer-history": "/reports/customers",
    "orders-summary": "/reports/orders",
    "inventory-low-stock": "/reports/inventory/low-stock",
    "restock-summary": "/reports/inventory/restock-summary",
    "inventory-restock-tracking": "/reports/inventory/restock-tracking",
    "resources-assignments": "/reports/resources/assignments",
    "supplier-order-details": "/reports/suppliers/orders",
  };

  const navigateById = (id: string) => {
    const path = reportRoute[id] ?? `/reports/${id}`; // sensible fallback
    router.push(path);
  };

  // Report categories with their respective reports
  const reportCategories = {
    inventory: {
      title: "Inventory Reports",
      icon: Package,
      color: "#3674B5",
      description:
        "Monitor stock levels, track restocking, and manage inventory across branches",
      reports: [
        {
          id: "inventory-low-stock",
          title: "Low Stock Alert",
          description: "Items below restock threshold requiring immediate attention",
          icon: AlertTriangle,
          urgency: "high",
        },
        {
          id: "restock-summary",
          title: "Restock Summary",
          description: "Overview of inventory restocking activities and status",
          icon: Package,
          urgency: "medium",
        },
        {
          id: "inventory-restock-tracking",
          title: "Restock Tracking",
          description: "Track incoming inventory and delivery schedules",
          icon: Truck,
          urgency: "medium",
        },
      ],
    },
    orders: {
      title: "Orders Reports",
      icon: ShoppingCart,
      color: "#10B981",
      description:
        "Track order performance, payment status, and customer purchase patterns",
      reports: [
        {
          id: "orders-summary",
          title: "Orders Summary",
          description:
            "Complete overview of all orders with status and payment details",
          icon: ShoppingCart,
          urgency: "low",
        },
      ],
    },
    customers: {
      title: "Customer Reports",
      icon: Users,
      color: "#F59E0B",
      description:
        "Analyze customer behavior, purchase history, and retention metrics",
      reports: [
        {
          id: "customer-history",
          title: "Customer History",
          description: "Detailed customer order history and purchasing patterns",
          icon: Users,
          urgency: "low",
        },
      ],
    },
    resources: {
      title: "Resources Reports",
      icon: Settings,
      color: "#8B5CF6",
      description: "Monitor resource assignments, utilization, and availability",
      reports: [
        {
          id: "resources-assignments",
          title: "Resource Assignments",
          description:
            "Track resource assignments and utilization across staff members",
          icon: Settings,
          urgency: "medium",
        },
      ],
    },
    suppliers: {
      title: "Supplier Reports",
      icon: Truck,
      color: "#EF4444",
      description:
        "Monitor supplier performance, purchase orders, and delivery tracking",
      reports: [
        {
          id: "supplier-order-details",
          title: "Supplier Order Details",
          description: "Detailed supplier orders and purchase order tracking",
          icon: Truck,
          urgency: "medium",
        },
      ],
    },
  } as const;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      default:
        return "#10B981";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      default:
        return "Standard";
    }
  };

  // Calculate totals
  const totalReports = Object.values(reportCategories).reduce(
    (sum, category) => sum + category.reports.length,
    0
  );
  const highPriorityReports = Object.values(reportCategories).reduce(
    (sum, category) => sum + category.reports.filter((r) => r.urgency === "high").length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
              <p className="text-gray-600">
                Generate and analyze business reports across all departments
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Access comprehensive reports for inventory, orders, customers, resources, and suppliers
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Available report types</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(reportCategories).length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Report categories</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#EF4444" }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{highPriorityReports}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Urgent reports</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Updated</p>
                <p className="text-2xl font-bold text-gray-900">Live</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Real-time data</p>
          </div>
        </div>

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(reportCategories).map(([categoryKey, category]) => {
            const IconComponent = category.icon as React.ElementType;
            const isSelected = selectedCategory === categoryKey;

            return (
              <div
                key={categoryKey}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
                  isSelected ? "border-gray-300 shadow-md" : "border-gray-200"
                }`}
              >
                {/* Category Header */}
                <div
                  className="p-6 border-b border-gray-200 cursor-pointer"
                  onClick={() => setSelectedCategory(isSelected ? null : categoryKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg text-white" style={{ backgroundColor: category.color }}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{category.reports.length} reports</span>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          isSelected ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Reports List - Expandable */}
                {isSelected && (
                  <div className="p-6 space-y-4">
                    {category.reports.map((report) => {
                      const ReportIcon = report.icon as React.ElementType;
                      return (
                        <div
                          key={report.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group"
                          onClick={() => navigateById(report.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                                <ReportIcon size={20} className="text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                                  {report.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                style={{ backgroundColor: getUrgencyColor(report.urgency) }}
                              >
                                {getUrgencyText(report.urgency)}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
              onClick={() => router.push("/reports/inventory/low-stock")}
            >
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertTriangle size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Critical Alerts</p>
                <p className="text-sm text-gray-600">Check high-priority reports</p>
              </div>
            </button>

            <button
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
              onClick={() => router.push("/reports/schedule")}
            >
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Schedule Reports</p>
                <p className="text-sm text-gray-600">Set up automated reports</p>
              </div>
            </button>

            <button
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
              onClick={() => router.push("/reports/analytics")}
            >
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics Dashboard</p>
                <p className="text-sm text-gray-600">View performance metrics</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
