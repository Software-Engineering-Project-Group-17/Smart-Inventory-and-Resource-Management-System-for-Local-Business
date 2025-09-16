"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FileText, 
  RefreshCw, 
  Download, 
  Printer, 
  Search,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { jsPDF } from "jspdf"; // PDF core (table export uses jspdf-autotable via dynamic import)

// ---------------- Types ----------------

type Row = Record<string, string | number | boolean | null | undefined>;

type ReportKey =
  | "inventory-low-stock"
  | "orders-summary"
  | "customer-history"
  | "resources-assignments"
  | "restock-summary"
  | "supplier-order-details"
  | "inventory-restock-tracking";

interface Filters {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  branch?: string;
  status?: string;
}

// ---------------- API Configuration ----------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005';

// ---------------- CSV Helpers ----------------

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

// ---------------- Labels ----------------

const REPORT_LABELS: Record<ReportKey, string> = {
  "inventory-low-stock": "Inventory – Low Stock",
  "orders-summary": "Orders – Summary",
  "customer-history": "Customer – Order History",
  "resources-assignments": "Resources – Assignments",
  "restock-summary": "Inventory – Restock Summary",
  "supplier-order-details": "Supplier – Order Details",
  "inventory-restock-tracking": "Inventory – Restock Tracking",
};

// ---------------- API Data Layer ----------------

async function getData(report: ReportKey, filters: Filters): Promise<Row[]> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.start) queryParams.append('start', filters.start);
    if (filters.end) queryParams.append('end', filters.end);
    if (filters.branch) queryParams.append('branch', filters.branch);
    if (filters.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/reports/${report}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.success && Array.isArray(data.result)) {
      return data.result;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${report} data:`, error);
    throw error;
  }
}

// ---------------- Component ----------------

export default function ReportsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const printRef = useRef<HTMLDivElement | null>(null);

  const defaultReport = (search.get("report") as ReportKey) || "inventory-low-stock";
  const [report, setReport] = useState<ReportKey>(defaultReport);
  const [filters, setFilters] = useState<Filters>({
    start: search.get("start") || "",
    end: search.get("end") || "",
    branch: search.get("branch") || "",
    status: search.get("status") || "",
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("report", report);
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    if (filters.branch) params.set("branch", filters.branch);
    if (filters.status) params.set("status", filters.status);
    router.replace(`/reports?${params.toString()}`);
  }, [report, filters, router]);

  // Load data from backend
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
    return () => { active = false; };
  }, [report, filters]);

  // Client-side search filter
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const canExport = filteredRows.length > 0;
  const title = REPORT_LABELS[report];

  // ---------------- PDF download via autotable ----------------
  const handleDownloadPDF = async () => {
  if (!filteredRows.length) return;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const headers = Object.keys(filteredRows[0]);

  autoTable(doc, {
    head: [headers.map((h) => h.replace(/_/g, " ").toUpperCase())],
    body: filteredRows.map((r) => headers.map((h) => String(r[h] ?? ""))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [54, 116, 181], textColor: 255, halign: "left" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: "grid",
    margin: { top: 40, left: 30, right: 30 },

    // ✅ Use doc to compute width; data.pageSize is undefined
    didDrawPage: () => {
      // robust across jsPDF versions
      const pageWidth =
        typeof (doc as any).internal?.pageSize?.getWidth === "function"
          ? (doc as any).internal.pageSize.getWidth()
          : (doc as any).internal?.pageSize?.width ??
            (doc as any).getPageWidth?.() ??
            842; // fallback: A4 landscape width in pt

      doc.setFontSize(12);
      doc.text(`Report: ${REPORT_LABELS[report]}`, 30, 24);

      const range = `${filters.start || "All"} → ${filters.end || "All"}`;
      doc.setFontSize(9);
      doc.text(`Date Range: ${range}`, 30, 36);

      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 180, 24);
    },
  });

  doc.save(`${report}-${new Date().toISOString().split("T")[0]}.pdf`);
};

  const handleRetry = () => {
    setError(null);
    setFilters((prev) => ({ ...prev }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div 
              className="p-3 rounded-xl text-white"
              style={{ backgroundColor: "#3674B5" }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Generate and manage your business reports</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing reports for: nimash.22@cse.mrt.ac.lk
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#3674B5" }}>
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Report</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{title}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRows.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Data entries found</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filters.start && filters.end ? "Set" : "All"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {filters.start && filters.end 
                ? `${filters.start} to ${filters.end}` 
                : "All available data"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Export Ready</p>
                <p className="text-2xl font-bold text-gray-900">
                  {canExport ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {canExport ? "Data available for export" : "No data to export"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,13H11V7H13M11,15H13V17H11M15.73,3H8.27L3,8.27V15.73L8.27,21H15.73L21,15.73V8.27L15.73,3Z" />
                </svg>
              </div>
              <div>
                <p className="text-red-800 font-medium">Error Loading Report</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: "#F59E0B" }}
              >
                <Filter size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Filters & Options</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={report}
                  onChange={(e) => setReport(e.target.value as ReportKey)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                >
                  {(Object.keys(REPORT_LABELS) as ReportKey[]).map((k) => (
                    <option key={k} value={k}>
                      {REPORT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              
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
                <input
                  type="text"
                  placeholder="e.g., PENDING"
                  value={filters.status || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
                />
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
                  placeholder="Search reports..."
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
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
                  onClick={() => canExport && downloadCSV(`${report}-${new Date().toISOString().split('T')[0]}.csv`, filteredRows)}
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
          {(() => {
            let tableContent: JSX.Element;
            if (loading) {
              tableContent = (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3674B5] mb-4"></div>
                  <p className="text-gray-500 text-lg font-medium">Loading report data...</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
                </div>
              );
            } else if (filteredRows.length === 0) {
              tableContent = (
                <div className="p-8 text-center">
                  <div 
                    className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "#F3F4F6" }}
                  >
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No Data Available</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {rows.length === 0 
                      ? "No data found for the selected filters." 
                      : "No data matches your search criteria."}
                  </p>
                </div>
              );
            } else {
              tableContent = (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "#3674B5" }}>
                        {Object.keys(filteredRows[0]).map((header) => (
                          <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                            {header.replace(/_/g, ' ')}
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
              );
            }
            return (
              <div ref={printRef} className="overflow-hidden">
                {tableContent}
              </div>
            );
          })()}
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