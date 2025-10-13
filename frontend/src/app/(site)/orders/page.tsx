"use client";

import React from "react";
import OrdersPage from "@/components/orders/OrdersPage";
import { withAuth } from "@/hooks/useAuth";

const OrderListPage = () => {
  return <OrdersPage />;
};

export default withAuth(OrderListPage, {
  requiredRoles: ["OWNER", "BRANCH_MANAGER", "STAFF"],
});
