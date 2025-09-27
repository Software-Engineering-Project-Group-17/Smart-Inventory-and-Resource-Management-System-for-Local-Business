"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Download,
  Printer,
  Search,
  Settings,
  Users,
  Filter,
  Truck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Types and helpers
export type Row = Record<string, string | number | boolean | null | undefined>;

interface Filters {
  start?: string;
  end?: string;
  branch?: string;
  status?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4005";

function toCSV(rows: Row[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const headerLine = headers.map(escape).join(",");
  const bodyLines = rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","));
  return [headerLine, ...bodyLines].join("\n");
}

function downloadCSV(filename: string, rows: Row[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function getData(report: string, filters: Filters): Promise<Row[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.start) queryParams.append("start", filters.start);
    if (filters.end) queryParams.append("end", filters.end);
    if (filters.branch) queryParams.append("branch", filters.branch);
    if (filters.status) queryParams.append("status", filters.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/reports/${report}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    else if (data.data && Array.isArray(data.data)) return data.data;
    else if (data.success && Array.isArray(data.result)) return data.result;
    else return [];
  } catch (error) {
    console.error(`Error fetching ${report} data:`, error);
    throw error as Error;
  }
}

export default function ResourcesReportsPage() {
  const printRef = useRef<HTMLDivElement | null>(null);

  const [report, setReport] = useState("resources-assignments");
  const [filters, setFilters] = useState<Filters>({ start: "", end: "", branch: "", status: "" });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Resources-specific reports
  const RESOURCES_REPORTS = {
    "resources-assignments": {
      label: "Resource Assignments",
      icon: Settings,
      description: "Track resource assignments and utilization across staff",
    },
  } as const;

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(report, filters);
        if (active) setRows(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? `Failed to load report data: ${err.message}`
              : "Failed to load report data. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [report, filters]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [rows, searchQuery]);

  const canExport = filteredRows.length > 0;
  const currentReport = RESOURCES_REPORTS[report as keyof typeof RESOURCES_REPORTS];

  // Calculate resource statistics
  const resourceStats = useMemo(() => {
    const totalResources = filteredRows.length;
    const assignedResources = filteredRows.filter(
      (row) => row.assigned_to && String(row.assigned_to).toLowerCase() !== "unassigned"
    ).length;
    const availableResources = filteredRows.filter(
      (row) => String(row.status || "").toLowerCase() === "available"
    ).length;
    const inUseResources = filteredRows.filter(
      (row) => String(row.status || "").toLowerCase() === "used"
    ).length;

    const resourceTypes = filteredRows.reduce((acc, row) => {
      const type = String(row.resource_type || "Unknown");
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResources,
      assignedResources,
      availableResources,
      inUseResources,
      unassignedResources: totalResources - assignedResources,
      resourceTypes,
    };
  }, [filteredRows]);

  const handleDownloadPDF = async () => {
    if (!filteredRows.length) return;
    alert(`PDF download would contain ${filteredRows.length} rows of ${currentReport.label} data`);
  };

  const handleRetry = () => {
    setError(null);
    setFilters((prev) => ({ ...prev }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resources Reports</h1>
              <p className="text-gray-600">Monitor resource assignments and utilization</p>
            </div>
          </div>
        </div>

        {/* Report Selection Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {Object.entries(RESOURCES_REPORTS).map(([key, config]) => {
            const IconComponent = config.icon as React.ElementType;
            const isSelected = report === key;
            return (
              <div
                key={key}
                onClick={() => setReport(key)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? "border-[#3674B5] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${isSelected ? "bg-[#3674B5] text-white" : "bg-gray-100 text-gray-600"}`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isSelected ? "text-[#3674B5]" : "text-gray-900"}`}>{config.label}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{resourceStats.totalResources}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">All resources</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{resourceStats.assignedResources}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Assigned to staff</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{resourceStats.availableResources}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Ready for use</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#EF4444" }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Use</p>
                <p className="text-2xl font-bold text-gray-900">{resourceStats.inUseResources}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Currently in use</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Error Loading Report</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button onClick={handleRetry} className="text-red-600 hover:text-red-800 font-medium text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Filter size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Filters & Options</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.start || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.end || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  placeholder="e.g., HQ"
                  value={filters.branch || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="used">In Use</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#3674B5] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#3674B5] transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() =>
                    canExport &&
                    downloadCSV(
                      `${report}-${new Date().toISOString().split("T")[0]}.csv`,
                      filteredRows
                    )
                  }
                  disabled={!canExport}
                  className="flex items-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-[#3674B5] disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <Download size={16} />
                  CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!canExport}
                  className="flex items-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-[#3674B5] disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: "#EF4444" }}
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div ref={printRef} className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3674B5] mb-4"></div>
                <p className="text-gray-500 text-lg font-medium">Loading resources data...</p>
                <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-8 text-center">
                <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "#F3F4F6" }}>
                  <Settings size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No Resources Data</p>
                <p className="text-gray-400 text-sm mt-1">
                  {rows.length === 0
                    ? "No resources found for the selected filters."
                    : "No resources match your search criteria."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#3674B5" }}>
                      {Object.keys(filteredRows[0]).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
                        >
                          {header.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                        {Object.keys(filteredRows[0]).map((key) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(row[key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:visible, .print\\:visible * { visibility: visible; }
          .print\\:visible { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
}
        