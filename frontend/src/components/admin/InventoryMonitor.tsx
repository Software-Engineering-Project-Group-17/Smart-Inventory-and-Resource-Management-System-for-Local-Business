"use client";
import React, { useState, useEffect } from "react";
import { useInventoryMonitoring } from "@/hooks/useInventoryMonitoring";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface InventoryMonitorProps {
  branchId?: string | number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

const InventoryMonitorComponent: React.FC<InventoryMonitorProps> = ({
  branchId,
  autoRefresh = true,
  refreshInterval = 300, // 5 minutes default
}) => {
  const { user } = useCurrentUser();
  const { isLoading, error, monitorInventory, checkInventoryStatus } =
    useInventoryMonitoring();

  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [monitoringResult, setMonitoringResult] = useState<any>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(autoRefresh);
  const [userBranchId, setUserBranchId] = useState<string | number | null>(
    null
  );

  // Get user's branch ID from staff table if not provided as prop
  useEffect(() => {
    const fetchUserBranchId = async () => {
      if (branchId) {
        setUserBranchId(branchId);
        return;
      }

      if (!user?.email) return;

      try {
        const response = await fetch(
          `/api/notifications?userEmail=${encodeURIComponent(user.email)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.branchId) {
            setUserBranchId(data.branchId);
          }
        }
      } catch (error) {
        console.error("Error fetching user branch ID:", error);
      }
    };

    fetchUserBranchId();
  }, [user?.email, branchId]);

  const currentBranchId = userBranchId;

  // Manual refresh function
  const handleRefresh = async () => {
    if (!currentBranchId) return;

    console.log(`🔄 Manual refresh triggered for branch ${currentBranchId}`);

    // Check current status
    const statusResult = await checkInventoryStatus(currentBranchId);
    if (statusResult) {
      setInventoryStatus(statusResult);
    }

    // Run monitoring to create notifications if needed
    const monitorResult = await monitorInventory(currentBranchId);
    if (monitorResult) {
      setMonitoringResult(monitorResult);
    }

    setLastCheck(new Date());
  };

  // Auto refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoRefreshEnabled && currentBranchId && refreshInterval > 0) {
      // Initial check
      handleRefresh();

      // Set up interval
      interval = setInterval(() => {
        console.log(`⏰ Auto refresh triggered for branch ${currentBranchId}`);
        handleRefresh();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRefreshEnabled, currentBranchId, refreshInterval, handleRefresh]);

  // Format time since last check
  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  if (!currentBranchId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No branch information available</p>
          <p className="text-sm">
            Please ensure you&apos;re logged in as a staff member
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Inventory Monitor
          </h2>
          <span className="text-sm text-gray-500">
            Branch {currentBranchId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAutoRefreshEnabled}
              onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Checking..." : "Check Now"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle size={16} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Last Check Info */}
      {lastCheck && (
        <div className="mb-4 text-sm text-gray-600">
          Last checked: {formatTimeSince(lastCheck)}
          {isAutoRefreshEnabled && (
            <span className="ml-2">
              (Next check in{" "}
              {Math.max(
                0,
                refreshInterval -
                  Math.floor(
                    (new Date().getTime() - lastCheck.getTime()) / 1000
                  )
              )}
              s)
            </span>
          )}
        </div>
      )}

      {/* Inventory Status Summary */}
      {inventoryStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package size={20} className="text-blue-600" />
              <span className="font-medium text-blue-800">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {inventoryStatus.summary.totalItems}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-red-600" />
              <span className="font-medium text-red-800">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              {inventoryStatus.summary.lowStock}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">
                Moderate Stock
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {inventoryStatus.summary.moderateStock}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-medium text-green-800">Good Stock</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {inventoryStatus.summary.goodStock}
            </p>
          </div>
        </div>
      )}

      {/* Monitoring Result */}
      {monitoringResult && (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">
            Last Monitoring Result
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {monitoringResult.summary.notificationsCreated}
              </p>
              <p className="text-sm text-gray-600">New Notifications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {monitoringResult.summary.lowStockItems}
              </p>
              <p className="text-sm text-gray-600">Low Stock Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {monitoringResult.summary.duplicatesSkipped}
              </p>
              <p className="text-sm text-gray-600">Duplicates Skipped</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
            {monitoringResult.message}
          </p>
        </div>
      )}

      {/* Low Stock Items List */}
      {inventoryStatus && inventoryStatus.inventoryItems && (
        <div>
          <h3 className="font-medium text-gray-800 mb-3">
            Items Requiring Attention
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {inventoryStatus.inventoryItems
              .filter((item: any) => item.stock_status === "low_stock")
              .map((item: any) => (
                <div
                  key={item.inventory_id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-800">
                      {item.inventory_name}
                    </p>
                    <p className="text-sm text-red-600">
                      Current: {item.quantity} | Threshold:{" "}
                      {item.low_stock_threshold}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  </div>
                </div>
              ))}

            {inventoryStatus.inventoryItems.filter(
              (item: any) => item.stock_status === "low_stock"
            ).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle
                  size={32}
                  className="mx-auto mb-2 text-green-500"
                />
                <p>No items require immediate attention</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMonitorComponent;
