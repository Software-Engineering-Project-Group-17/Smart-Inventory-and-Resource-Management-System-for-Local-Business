"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import CreateOrderModal from "@/components/CreateOrderModal";
import RequestHeader from "@/components/RequestHeader";
import RequestDetails from "@/components/RequestDetails";
import RequestedItemsList from "@/components/RequestedItemsList";
import SupplierOrdersList from "@/components/SupplierOrdersList";
import RequestInfoSidebar from "@/components/RequestInfoSidebar";
import RequestActionButtons from "@/components/RequestActionButtons";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

interface RequestDetailData {
  success: boolean;
  data: {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    total_estimated_cost: number;
    required_by_date: string;
    created_at: string;
    updated_at: string;
    notes?: string;

    branch: {
      id: number;
      name: string;
      location: string;
      contact_number?: string;
      description?: string;
    };

    created_by: {
      id: number;
      name: string;
      email: string;
    };

    items: Array<{
      id: number;
      inventory_id: number;
      inventory_name: string;
      requested_quantity: number;
      estimated_unit_price: number;
      current_stock: number;
      low_stock_threshold: number;
      current_unit_price: number;
      image_url?: string;
      notes?: string;
      created_at: string;
      category: {
        id: number;
        name: string;
        image_url?: string;
      };
    }>;

    supplier_orders: Array<{
      id: number;
      supplier_id: number;
      supplier_name: string;
      supplier_email: string;
      supplier_tel?: string;
      order_status: string;
      payment_status: string;
      total_amount: number;
      estimated_delivery_date?: string;
      supplier_notes?: string;
      created_at: string;
      items_count: number;
      total_offered_quantity: number;
    }>;

    statistics: {
      total_items: number;
      total_quantity_requested: number;
      total_estimated_value: number;
      supplier_orders_count: number;
    };
  };
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, supplier } = useAuth();
  const [requestData, setRequestData] = useState<RequestDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/supplier/restock-requests/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch request details");
        }

        const data = await response.json();
        setRequestData(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch request details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRequestDetail();
    }
  }, [params.id]);

  const isUrgent = (requiredByDate: string, priority: string) => {
    const required = new Date(requiredByDate);
    const today = new Date();
    const daysLeft = Math.ceil(
      (required.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return priority === "urgent" || daysLeft <= 3;
  };

  const getDaysLeft = (requiredByDate: string) => {
    const required = new Date(requiredByDate);
    const today = new Date();
    return Math.ceil(
      (required.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleCreateOrder = () => {
    if (!user || !supplier) {
      router.push(
        "/auth/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
    } else {
      setCreateOrderModalOpen(true);
    }
  };

  const handleOrderCreated = () => {
    if (params.id) {
      const fetchRequestDetail = async () => {
        try {
          const response = await fetch(
            `/api/supplier/restock-requests/${params.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setRequestData(data);
          }
        } catch (err) {
          console.error("Error refreshing request data:", err);
        }
      };
      fetchRequestDetail();
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !requestData?.success) {
    return (
      <ErrorState
        error={error || "Failed to load request details"}
        onBack={() => router.back()}
      />
    );
  }

  const request = requestData.data;
  const daysLeft = getDaysLeft(request.required_by_date);
  const isRequestUrgent = isUrgent(request.required_by_date, request.priority);

  // Calculate current supplier's order count
  const currentSupplierOrdersCount = supplier?.id
    ? request.supplier_orders.filter(
        (order) => order.supplier_id === supplier.id
      ).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <RequestHeader
        title={request.title}
        id={request.id}
        status={request.status}
        priority={request.priority}
        isUrgent={isRequestUrgent}
        daysLeft={daysLeft}
        onBack={() => router.back()}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <RequestDetails
              description={request.description}
              notes={request.notes}
              statistics={request.statistics}
              isAuthenticated={!!user && !!supplier}
              currentSupplierOrdersCount={currentSupplierOrdersCount}
            />

            <RequestedItemsList items={request.items} />

            <SupplierOrdersList
              orders={request.supplier_orders}
              isAuthenticated={!!user && !!supplier}
              currentSupplierId={supplier?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RequestInfoSidebar
              requiredByDate={request.required_by_date}
              createdAt={request.created_at}
              daysLeft={daysLeft}
              branch={request.branch}
              createdBy={request.created_by}
            />

            <RequestActionButtons
              onCreateOrder={handleCreateOrder}
              canCreateOrder={true}
              user={user}
              supplier={supplier}
              requestStatus={request.status}
            />
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {requestData && (
        <CreateOrderModal
          isOpen={createOrderModalOpen}
          onClose={() => setCreateOrderModalOpen(false)}
          requestId={request.id}
          requestTitle={request.title}
          items={request.items}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
}
