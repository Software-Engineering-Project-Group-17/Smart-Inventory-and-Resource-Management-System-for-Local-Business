"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  ArrowLeft,
  Eye,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { toastUtils } from "@/lib/toast-utils";
import { withAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";

interface Supplier {
  id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_tel: string;
  created_at: string;
  total_orders: number;
  paid_orders: number;
  total_paid_amount: number;
}

interface SupplierStats {
  totalSuppliers: number;
  totalPaidOrders: number;
  totalPaidAmount: number;
  averageOrderValue: number;
}

const SuppliersPage = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<SupplierStats>({
    totalSuppliers: 0,
    totalPaidOrders: 0,
    totalPaidAmount: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchTerm, suppliers]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/suppliers");

      if (response.ok) {
        const data = await response.json();
        const suppliersList = data.data.suppliers || [];
        setSuppliers(suppliersList);

        // Calculate statistics
        const totalPaidOrders = suppliersList.reduce(
          (sum: number, supplier: Supplier) =>
            sum + Number(supplier.paid_orders || 0),
          0
        );
        const totalPaidAmount = suppliersList.reduce(
          (sum: number, supplier: Supplier) =>
            sum + Number(supplier.total_paid_amount || 0),
          0
        );

        setStats({
          totalSuppliers: suppliersList.length,
          totalPaidOrders,
          totalPaidAmount,
          averageOrderValue:
            totalPaidOrders > 0 ? totalPaidAmount / totalPaidOrders : 0,
        });

        toastUtils.dataLoaded("Suppliers", suppliersList.length);
      } else {
        toastUtils.dataError("loading suppliers", "Failed to load suppliers");
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toastUtils.networkError();
    } finally {
      setIsLoading(false);
    }
  };

  const filterSuppliers = () => {
    if (!searchTerm.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(
      (supplier) =>
        supplier.supplier_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.supplier_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#3674B5]" />
          <span className="text-lg text-gray-600">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Supplier Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage supplier relationships and track order performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Store size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Suppliers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSuppliers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPaidOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Paid Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalPaidAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search suppliers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5]"
              />
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Suppliers ({filteredSuppliers.length})
            </h2>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="p-8 text-center">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm
                  ? "No suppliers found matching your search"
                  : "No suppliers found"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-[#3674B5] hover:text-blue-900 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Store size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {supplier.supplier_name}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} />
                          <span>{supplier.supplier_email}</span>
                        </div>
                        {supplier.supplier_tel && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={16} />
                            <span>{supplier.supplier_tel}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Since {formatDate(supplier.created_at)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {supplier.total_orders} total orders
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm text-gray-600">
                            {supplier.paid_orders} paid orders
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {formatCurrency(supplier.total_paid_amount)} total
                            paid
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/inventory/suppliers/${supplier.id}`)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] hover:bg-blue-900 text-white rounded-md transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(SuppliersPage, {
  requiredRoles: [ROLES.STAFF, ROLES.BRANCH_MANAGER, ROLES.OWNER],
});
