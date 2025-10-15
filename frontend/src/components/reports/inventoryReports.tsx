"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  FileText, 
  RefreshCw, 
  Download, 
  Printer, 
  Search,
  Package,
  TrendingDown,
  Calendar,
  Filter,
  AlertTriangle
} from 'lucide-react';

// Types and helpers (same as original)
type Row = Record<string, string | number | boolean | null | undefined>;

interface Filters {
  start?: string;
  end?: string;
  branch?: string;
  status?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_REPORTS_ANALYTICS_API_URL || 'http://localhost:4005';

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
    if (filters.start) queryParams.append('start', filters.start);
    if (filters.end) queryParams.append('end', filters.end);
    if (filters.branch) queryParams.append('branch', filters.branch);
    if (filters.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/reports/${report}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    throw error;
  }
}

export default function InventoryReportsPage() {
  const printRef = useRef<HTMLDivElement | null>(null);

  const [report, setReport] = useState("inventory-low-stock");
  const [filters, setFilters] = useState<Filters>({
    start: "",
    end: "",
    branch: "",
    status: "",
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Inventory-specific reports
  const INVENTORY_REPORTS = {
    "inventory-low-stock": {
      label: "Low Stock Alert",
      icon: AlertTriangle,
      description: "Items below restock threshold"
    },
    "restock-summary": {
      label: "Restock Summary", 
      icon: Package,
      description: "Inventory restocking overview"
    },
    "inventory-restock-tracking": {
      label: "Restock Tracking",
      icon: TrendingDown,
      description: "Track incoming inventory"
    }
  };

  // Update URL in browser (if needed)
  useEffect(() => {
    // In a real Next.js app, you would update the URL here
    // For now, we'll just track the state locally
    console.log('Report changed to:', report, 'with filters:', filters);
  }, [report, filters]);

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

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const canExport = filteredRows.length > 0;
  const currentReport = INVENTORY_REPORTS[report as keyof typeof INVENTORY_REPORTS];

  const handleDownloadPDF = async () => {
  if (!filteredRows.length) return;

  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'l', unit: 'pt' }); // landscape for wide tables

  const headers = Object.keys(filteredRows[0]);
  const head = [headers.map(h => h.replace(/_/g, ' '))];
  const body = filteredRows.map(r => headers.map(h => String((r as any)[h] ?? '')));

  // Header
  doc.setFontSize(16);
  doc.text(currentReport.label, 40, 32);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 48);

  // Table
  autoTable(doc, {
    head,
    body,
    startY: 60,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [54, 116, 181], textColor: 255 },
    didDrawPage: (data) => {
      // optional footer
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.text(
        `${report} • ${filteredRows.length} rows`,
        pageWidth - 40,
        pageHeight - 20,
        { align: 'right' }
      );
    }
  });

  doc.save(`${report}-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
              <p className="text-gray-600">Monitor stock levels and restocking activities</p>
            </div>
          </div>
        </div>

        {/* Report Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.entries(INVENTORY_REPORTS).map(([key, config]) => {
            const IconComponent = config.icon;
            const isSelected = report === key;
            return (
              <div
                key={key}
                onClick={() => setReport(key)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#3674B5] bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-[#3674B5] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isSelected ? 'text-[#3674B5]' : 'text-gray-900'}`}>
                      {config.label}
                    </h3>
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
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Report</p>
                <p className="text-xl font-bold text-gray-900">{currentReport.label}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#10B981" }}>
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRows.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Inventory entries</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-xl font-bold text-gray-900">
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
              <div className="p-3 rounded-lg text-white" style={{ backgroundColor: "#EF4444" }}>
                <AlertTriangle size={24} />
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
                <AlertTriangle className="w-4 h-4 text-red-600" />
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
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Branch (name or ID)
  </label>
  <input
    type="text"
    placeholder="e.g., HQ or 1"
    value={filters.branch || ""}
    onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value.trimStart() }))}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
  />
</div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  placeholder="e.g., LOW"
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
                  placeholder="Search inventory reports..."
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
          <div ref={printRef} className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3674B5] mb-4"></div>
                <p className="text-gray-500 text-lg font-medium">Loading inventory data...</p>
                <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-8 text-center">
                <div 
                  className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  <Package size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No Inventory Data</p>
                <p className="text-gray-400 text-sm mt-1">
                  {rows.length === 0 
                    ? "No inventory data found for the selected filters." 
                    : "No inventory data matches your search criteria."}
                </p>
              </div>
            ) : (
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