"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface RequestActionButtonsProps {
  onCreateOrder: () => void;
  canCreateOrder: boolean;
  user: any;
  supplier: any;
  requestStatus: string;
}

export default function RequestActionButtons({
  onCreateOrder,
  canCreateOrder,
  user,
  supplier,
  requestStatus,
}: RequestActionButtonsProps) {
  const isAuthenticated = !!user && !!supplier;
  const isCompleted =
    requestStatus === "completed" || requestStatus === "cancelled";

  const getButtonText = () => {
    if (!isAuthenticated) {
      return "Log in to Create Order";
    }
    if (isCompleted) {
      return "Cannot Create Order (Request Closed)";
    }
    return "Create Supplier Order";
  };

  const getButtonSubText = () => {
    if (!isAuthenticated) {
      return "You must be logged in as a supplier to create orders";
    }
    if (isCompleted) {
      return `This request is ${requestStatus} and no longer accepts new orders`;
    }
    return null;
  };

  const subText = getButtonSubText();

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={onCreateOrder}
            disabled={!isAuthenticated || isCompleted}
            variant={!isAuthenticated ? "outline" : "default"}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {getButtonText()}
          </Button>
          {subText && (
            <p className="text-xs text-gray-500 text-center px-2">{subText}</p>
          )}
        </div>

        <Button className="w-full" variant="outline">
          Contact branch for any clarifications
        </Button>
      </CardContent>
    </Card>
  );
}
