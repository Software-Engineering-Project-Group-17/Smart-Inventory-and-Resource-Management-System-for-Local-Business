import { toast } from "sonner";

export const toastUtils = {
  // Success toast with undo action
  addToCartSuccess: (
    productName: string,
    quantity: number,
    price: number,
    onUndo: () => void
  ) => {
    toast.success(`Added ${quantity} ${productName} to cart!`, {
      description: `${quantity} item${quantity > 1 ? "s" : ""} added for $${(
        price * quantity
      ).toFixed(2)}`,
      action: {
        label: "Undo",
        onClick: onUndo,
      },
      duration: 5000,
    });
  },

  // Order confirmation with view order action
  orderSuccess: (orderId: string | number, onViewOrder?: () => void) => {
    toast.success("Order placed successfully!", {
      description: `Order #${orderId} has been confirmed and is being processed.`,
      action: onViewOrder
        ? {
            label: "View Order",
            onClick: onViewOrder,
          }
        : undefined,
      duration: 6000,
    });
  },

  // Payment success with receipt action
  paymentSuccess: (amount: number, onViewReceipt?: () => void) => {
    toast.success("Payment completed!", {
      description: `Payment of $${amount.toFixed(
        2
      )} was processed successfully.`,
      //   action: onViewReceipt
      //     ? {
      //         label: "View Receipt",
      //         onClick: onViewReceipt,
      //       }
      //     : undefined,
      duration: 6000,
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

  // Custom toast with rich content
  custom: (component: (id: string | number) => React.ReactElement) => {
    toast.custom(component, {
      duration: 5000,
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
};

// Example usage:
/*
// Basic add to cart with undo
toastUtils.addToCartSuccess("iPhone 15", 1, 999, () => {
  removeFromCart(productId);
});

// Order placement with loading state
const orderPromise = placeOrder(orderData);
toastUtils.promise(orderPromise, {
  loading: "Placing your order...",
  success: (order) => `Order #${order.id} placed successfully!`,
  error: "Failed to place order. Please try again.",
});

// Error with retry
toastUtils.errorWithRetry("Failed to load products", () => {
  fetchProducts();
});

// Custom loading with manual update
const loadingToast = toastUtils.loading("Processing payment...");
// Later...
toastUtils.updateToSuccess(loadingToast, "Payment successful!");
*/
