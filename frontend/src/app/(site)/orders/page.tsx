"use client";

import React from "react";
import OrdersPage from "@/components/orders/OrdersPage";
import { withAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";

const OrderListPage = () => {
  return <OrdersPage />;
};

export default withAuth(OrderListPage, {
  requiredRoles: [ROLES.OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
});
