"use client";
import React, { useState, useEffect } from "react";
import { withAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/auth";
import { RestockRequest } from "@/types/restock";
import { InventoryItem } from "@/lib/api/inventory";
import {
  CreateRestockRequestModal,
  LowStockAlert,
  RestockFilters,
  RestockRequestsTable,
  PageHeader,
  ErrorState,
} from "@/components/restock-requests";
import { toastUtils } from "@/lib/toast-utils";
import { showRoleAccessNotification } from "@/lib/auth";

// Main Restock Requests Page
const RestockRequestsPage = () => {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>(
    []
  );
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (searchTerm) params.append("search", searchTerm);

      // Get user profile for authentication
      const userProfile = getUserProfile();

      const headers: HeadersInit = {};
      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch(`/api/restock-requests?${params}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to load restock requests");
      }
    } catch (err) {
      setError("Failed to load restock requests");
      console.error("Error loading requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      // Get user profile for authentication
      const userProfile = getUserProfile();

      const headers: HeadersInit = {};
      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch("/api/inventory-branch", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();

        // Store all inventory items
        setAllInventory(data.inventory);

        // Filter to show only low stock items and sort by urgency
        const lowStockItems = data.inventory
          .filter(
            (item: InventoryItem) => item.currentStock <= item.reorderLevel
          )
          .sort((a: InventoryItem, b: InventoryItem) => {
            // Sort by urgency: items with lower stock relative to threshold first
            const aUrgency = a.currentStock / (a.reorderLevel || 1);
            const bUrgency = b.currentStock / (b.reorderLevel || 1);
            return aUrgency - bUrgency;
          });

        setAvailableInventory(lowStockItems);
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
    }
  };

  useEffect(() => {
    // showRoleAccessNotification("Restock Requests");
    loadRequests();
    loadInventory();
  }, [statusFilter, priorityFilter, searchTerm]);

  const handleCreateRequest = () => {
    setIsCreateModalOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearchTerm("");
  };

  const handleCancelRequest = async (request: RestockRequest) => {
    if (
      !confirm(
        `Are you sure you want to cancel the request "${request.title}"? This will also cancel any unpaid supplier orders.`
      )
    ) {
      return;
    }

    try {
      setIsCancelling(request.id);
      const userProfile = getUserProfile();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (userProfile) {
        headers["x-user-id"] = userProfile.id;
        headers["x-user-email"] = userProfile.email;
      }

      const response = await fetch(
        `/api/restock-requests/${request.id}/cancel`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (response.ok) {
        // Refresh the data to show updated status
        loadRequests();
      } else {
        const errorData = await response.json();
        toastUtils.error(
          "Cancel Failed",
          `Failed to cancel request: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Error cancelling request:", err);
      toastUtils.error(
        "Cancel Failed",
        "Failed to cancel request. Please try again."
      );
    } finally {
      setIsCancelling(null);
    }
  };

  if (error) {
    return <ErrorState error={error} onRetry={loadRequests} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader onCreateRequest={handleCreateRequest} />

          <LowStockAlert
            availableInventory={availableInventory}
            onCreateRequest={handleCreateRequest}
          />

          <RestockFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onClearFilters={handleClearFilters}
          />

          <RestockRequestsTable
            requests={requests}
            isLoading={isLoading}
            onCreateRequest={handleCreateRequest}
            onCancelRequest={handleCancelRequest}
            isCancelling={isCancelling}
          />
        </div>
      </div>

      <CreateRestockRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadRequests}
        availableInventory={availableInventory}
        allInventory={allInventory}
      />
    </div>
  );
};

export default withAuth(RestockRequestsPage, {
  requiredRoles: ["STAFF", "BRANCH_MANAGER", "OWNER"],
});
