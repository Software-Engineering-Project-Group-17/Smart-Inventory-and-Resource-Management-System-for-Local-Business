import { toast } from "sonner";

export const toastUtils = {
  // Order creation success with action
  orderCreated: (orderId: string | number, onViewOrder?: () => void) => {
    toast.success("Order created successfully!", {
      description: `Supplier order #${orderId} has been submitted and is awaiting customer payment.`,
      //   action: onViewOrder
      //     ? {
      //         label: "View Order",
      //         onClick: onViewOrder,
      //       }
      //     : undefined,
      duration: 6000,
    });
  },

  // Request handling success
  requestHandled: (
    action: "accepted" | "rejected",
    requestId: string | number
  ) => {
    const message =
      action === "accepted" ? "Request accepted!" : "Request rejected";
    const description =
      action === "accepted"
        ? `Restock request #${requestId} has been accepted. You can now create orders for the requested items.`
        : `Restock request #${requestId} has been rejected and marked as closed.`;

    toast.success(message, {
      description,
      duration: 5000,
    });
  },

  // Order cancellation with undo
  orderCancelled: (orderId: string | number, onUndo?: () => void) => {
    toast.warning("Order cancelled", {
      description: `Order #${orderId} has been cancelled and can no longer be processed.`,
      action: onUndo
        ? {
            label: "Undo",
            onClick: onUndo,
          }
        : undefined,
      duration: 8000,
    });
  },

  // Error with retry action
  errorWithRetry: (message: string, onRetry?: () => void) => {
    toast.error("Something went wrong", {
      description: message,
      action: onRetry
        ? {
            label: "Retry",
            onClick: onRetry,
          }
        : undefined,
      duration: 8000,
    });
  },

  // Loading toast that can be updated
  loading: (message: string) => {
    return toast.loading(message, {
      duration: Infinity, // Will stay until manually dismissed
    });
  },

  // Update loading toast to success
  updateToSuccess: (
    toastId: string | number,
    message: string,
    description?: string
  ) => {
    toast.success(message, {
      id: toastId,
      description,
      duration: 4000,
    });
  },

  // Update loading toast to error
  updateToError: (
    toastId: string | number,
    message: string,
    description?: string
  ) => {
    toast.error(message, {
      id: toastId,
      description,
      duration: 6000,
    });
  },

  // Warning toast
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  // Info toast with action
  infoWithAction: (
    message: string,
    description: string,
    actionLabel: string,
    onAction: () => void
  ) => {
    toast.info(message, {
      description,
      action: {
        label: actionLabel,
        onClick: onAction,
      },
      duration: 6000,
    });
  },

  // Success toast
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  // Error toast
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  // Promise toast (automatically handles loading, success, error states)
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  // Supplier-specific: Inventory update notification
  inventoryUpdated: (
    itemName: string,
    quantity: number,
    action: "added" | "removed"
  ) => {
    const message =
      action === "added" ? "Inventory updated" : "Inventory reduced";
    const description = `${quantity} units of ${itemName} ${
      action === "added" ? "added to" : "removed from"
    } inventory.`;

    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  // Supplier-specific: Price update confirmation
  priceUpdated: (
    itemName: string,
    oldPrice: number,
    newPrice: number,
    onUndo?: () => void
  ) => {
    toast.success("Price updated successfully", {
      description: `${itemName}: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(
        2
      )}`,
      action: onUndo
        ? {
            label: "Undo",
            onClick: onUndo,
          }
        : undefined,
      duration: 6000,
    });
  },

  // Supplier-specific: New request notification
  newRequest: (
    requestId: string | number,
    itemCount: number,
    onViewRequest?: () => void
  ) => {
    toast.info("New restock request received!", {
      description: `Request #${requestId} contains ${itemCount} item${
        itemCount > 1 ? "s" : ""
      } awaiting your response.`,
      action: onViewRequest
        ? {
            label: "View Request",
            onClick: onViewRequest,
          }
        : undefined,
      duration: 8000,
    });
  },

  // Supplier-specific: Payment received notification
  paymentReceived: (
    orderId: string | number,
    amount: number,
    onViewOrder?: () => void
  ) => {
    toast.success("Payment received!", {
      description: `Order #${orderId} payment of $${amount.toFixed(
        2
      )} has been processed successfully.`,
      action: onViewOrder
        ? {
            label: "View Order",
            onClick: onViewOrder,
          }
        : undefined,
      duration: 6000,
    });
  },
};

// Example usage for supplier-specific scenarios:
/*
// Order creation
toastUtils.orderCreated("ORD-12345", () => router.push('/orders/12345'));

// Request handling
toastUtils.requestHandled("accepted", "REQ-789");

// Order cancellation with undo
toastUtils.orderCancelled("ORD-12345", () => restoreOrder());

// Error handling
toastUtils.errorWithRetry("Failed to load orders", () => fetchOrders());

// Loading with manual update
const loadingToast = toastUtils.loading("Creating order...");
// Later...
toastUtils.updateToSuccess(loadingToast, "Order created successfully!");

// Inventory operations
toastUtils.inventoryUpdated("Wireless Mouse", 50, "added");

// Price updates with undo
toastUtils.priceUpdated("Keyboard", 29.99, 34.99, () => revertPrice());

// New request notification
toastUtils.newRequest("REQ-123", 5, () => router.push('/requests/123'));

// Payment notifications
toastUtils.paymentReceived("ORD-456", 299.99, () => router.push('/orders/456'));
*/
