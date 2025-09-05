"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Ban,
} from "lucide-react";
import {
  RestockRequest,
  RESTOCK_STATUSES,
  RESTOCK_PRIORITIES,
} from "@/types/restock";

interface RestockRequestsTableProps {
  requests: RestockRequest[];
  isLoading: boolean;
  onCreateRequest: () => void;
  onCancelRequest?: (request: RestockRequest) => void;
  isCancelling?: number | null;
}

const RestockRequestsTable: React.FC<RestockRequestsTableProps> = ({
  requests,
  isLoading,
  onCreateRequest,
  onCancelRequest,
  isCancelling,
}) => {
  const router = useRouter();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "active":
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return (
      RESTOCK_STATUSES[status as keyof typeof RESTOCK_STATUSES]?.color || "gray"
    );
  };

  const getPriorityColor = (priority: string) => {
    return (
      RESTOCK_PRIORITIES[priority as keyof typeof RESTOCK_PRIORITIES]?.color ||
      "gray"
    );
  };

  const canCancelRequest = (request: RestockRequest) => {
    return request.status !== "cancelled" && request.status !== "completed";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No restock requests found
          </h3>
          <p className="text-gray-600 mb-4">
            No requests match your current filters or you haven't created any
            yet.
          </p>
          <button
            onClick={onCreateRequest}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Required By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.title}
                    </div>
                    {request.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {request.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Created{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(
                      request.status
                    )}-100 text-${getStatusColor(request.status)}-800`}
                  >
                    {getStatusIcon(request.status)}
                    <span className="ml-1">
                      {RESTOCK_STATUSES[
                        request.status as keyof typeof RESTOCK_STATUSES
                      ]?.label || request.status}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(
                      request.priority
                    )}-100 text-${getPriorityColor(request.priority)}-800`}
                  >
                    {RESTOCK_PRIORITIES[
                      request.priority as keyof typeof RESTOCK_PRIORITIES
                    ]?.label || request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <span className="font-medium">
                      {request.item_count || 0}
                    </span>{" "}
                    items
                  </div>
                  <div className="text-xs text-gray-500">
                    Qty: {request.total_quantity_requested || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.required_by_date ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(request.required_by_date).toLocaleDateString()}
                    </div>
                  ) : (
                    "Not specified"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/inventory/restock-requests/${request.id}`)
                      }
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canCancelRequest(request) && onCancelRequest && (
                      <button
                        onClick={() => onCancelRequest(request)}
                        disabled={isCancelling === request.id}
                        className="text-red-600 hover:text-red-900 disabled:text-red-400 disabled:cursor-not-allowed"
                        title={
                          isCancelling === request.id
                            ? "Cancelling..."
                            : "Cancel Request"
                        }
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestockRequestsTable;
