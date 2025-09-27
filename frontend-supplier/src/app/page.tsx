"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  DollarSign,
  Package,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Building2,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  RestockRequestsResponse,
  RestockRequestFilters,
} from "@/types/supplier-restock";

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  pending: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Home() {
  const { user, supplier, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RestockRequestsResponse | null>(
    null
  );
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [filters, setFilters] = useState<RestockRequestFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!user || !supplier) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/supplier/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBranches(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    fetchBranches();
  }, [user, supplier]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      // Add filters to params
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.branch_id)
        params.append("branch_id", filters.branch_id.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (filters.required_by_date_from)
        params.append("required_by_date_from", filters.required_by_date_from);
      if (filters.required_by_date_to)
        params.append("required_by_date_to", filters.required_by_date_to);

      const response = await fetch(`/api/supplier/restock-requests?${params}`);
      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, sortBy, sortOrder, filters, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (key: keyof RestockRequestFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
    // Force re-render by setting sort values
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUrgent = (requiredByDate?: string, priority?: string) => {
    if (!requiredByDate || !priority) return false;
    const required = new Date(requiredByDate);
    const today = new Date();
    const daysLeft = Math.ceil(
      (required.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return priority === "urgent" || daysLeft <= 3;
  };

  // Show loading state while checking authentication or loading requests
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user && supplier
                  ? `Welcome back, ${supplier.supplier_name}!`
                  : "Restock Requests"}
              </h1>
              <p className="text-gray-600 mt-1">
                {user && supplier
                  ? "Manage restock requests from retail branches"
                  : "Browse available restock requests. Login to create orders."}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {requests?.total_count || 0} Active Requests
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters and Search */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={sortOrder}
                onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "priority",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="required_by_date">
                    Required Date
                  </SelectItem>
                  <SelectItem value="total_estimated_cost">
                    Estimated Cost
                  </SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Select
                value={filters.branch_id?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "branch_id",
                    value === "all" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests Grid */}
        {requests && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.requests.map((request) => (
                <Card
                  key={request.id}
                  className={`hover:shadow-lg transition-shadow ${
                    isUrgent(request.required_by_date, request.priority)
                      ? "ring-2 ring-red-200"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {request.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.branch_name}
                        </p>
                      </div>
                      {isUrgent(request.required_by_date, request.priority) && (
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge className={STATUS_COLORS[request.status]}>
                        {request.status}
                      </Badge>
                      <Badge className={PRIORITY_COLORS[request.priority]}>
                        {request.priority}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{request.total_items_requested ?? 0} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {request.required_by_date
                            ? formatDate(request.required_by_date)
                            : "No date set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </div>

                    {(request.supplier_orders_count ?? 0) == 0 && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm text-amber-700">
                          No Supplier Orders created yet.
                        </p>
                      </div>
                    )}

                    {(request.supplier_orders_count ?? 0) > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          {request.supplier_orders_count ?? 0} supplier order(s)
                          •{request.paid_orders_count ?? 0} paid •
                          {formatCurrency(request.total_paid_amount ?? 0)}{" "}
                          received
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/supplier/requests/${request.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {requests.total_count > 12 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(requests.total_count / 12)}
                </span>

                <Button
                  variant="outline"
                  disabled={currentPage >= Math.ceil(requests.total_count / 12)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {requests && requests.requests.length === 0 && (
          <Card>
            <CardContent className="pt-16 pb-16 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No restock requests found
              </h3>
              <p className="text-gray-600">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No restock requests are currently available"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
