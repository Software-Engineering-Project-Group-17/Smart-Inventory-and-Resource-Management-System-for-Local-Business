import { toast } from "sonner";

export const toastUtils = {
  // Authentication Success
  loginSuccess: (role: string, userName?: string) => {
    const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1);
    const message = userName ? `Welcome back, ${userName}!` : `Welcome back!`;
    const description = `Successfully logged in as ${roleDisplayName}. Redirecting to your dashboard...`;
    
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  // Authentication Errors
  loginError: (errorCode: string, customMessage?: string) => {
    let message = "Login Failed";
    let description = customMessage || "Please check your credentials and try again.";

    switch (errorCode) {
      case "auth/user-not-found":
        description = "No account found with this email address";
        break;
      case "auth/wrong-password":
        description = "Incorrect password. Please try again";
        break;
      case "auth/invalid-email":
        description = "Please enter a valid email address";
        break;
      case "auth/too-many-requests":
        description = "Too many failed attempts. Please try again later";
        break;
      case "auth/user-disabled":
        description = "This account has been disabled. Contact support for assistance";
        break;
      case "auth/invalid-credential":
        description = "Invalid login credentials. Please check your email and password";
        break;
    }

    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  // Registration Success
  registrationSuccess: (role: string) => {
    const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1);
    toast.success("Account Created Successfully!", {
      description: `Your ${roleDisplayName} account has been created. You can now access the system.`,
      duration: 5000,
    });
  },

  // Registration Errors
  registrationError: (errorCode: string, customMessage?: string) => {
    let message = "Registration Failed";
    let description = customMessage || "Unable to create account. Please try again.";

    switch (errorCode) {
      case "auth/email-already-in-use":
        description = "An account with this email already exists";
        break;
      case "auth/weak-password":
        description = "Password is too weak. Please use at least 6 characters";
        break;
      case "auth/invalid-email":
        description = "Please enter a valid email address";
        break;
    }

    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  // Logout Success
  logoutSuccess: () => {
    toast.success("Logged Out Successfully", {
      description: "You have been safely logged out of the system",
      duration: 3000,
    });
  },

  // Data Operations
  dataLoaded: (dataType: string, count?: number) => {
    const description = count !== undefined 
      ? `Loaded ${count} ${dataType.toLowerCase()}${count !== 1 ? 's' : ''}`
      : `${dataType} data loaded successfully`;
    
    toast.success("Data Loaded", {
      description,
      duration: 2000,
    });
  },

  dataError: (operation: string, details?: string) => {
    toast.error(`Failed to ${operation}`, {
      description: details || "Please check your connection and try again",
      duration: 5000,
    });
  },

  // Form Submissions
  formSuccess: (action: string, itemName?: string) => {
    const message = `${action} Successful`;
    const description = itemName 
      ? `${itemName} has been ${action.toLowerCase()} successfully`
      : `Operation completed successfully`;
    
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  formError: (action: string, error?: string) => {
    toast.error(`${action} Failed`, {
      description: error || "Please check your input and try again",
      duration: 5000,
    });
  },

  // Validation Errors
  validationError: (message: string, details?: string) => {
    toast.warning("Validation Error", {
      description: details || message,
      duration: 4000,
    });
  },

  // Permission Errors
  permissionError: (action: string) => {
    toast.error("Access Denied", {
      description: `You don't have permission to ${action}. Contact your administrator for access.`,
      duration: 5000,
    });
  },

  // Network Errors
  networkError: () => {
    toast.error("Connection Error", {
      description: "Unable to connect to the server. Please check your internet connection.",
      duration: 6000,
    });
  },

  // Generic Success
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  // Generic Error
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  // Generic Warning
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  // Generic Info
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  // Inventory Specific
  inventoryUpdate: (action: string, itemName: string, quantity?: number) => {
    const description = quantity 
      ? `${itemName}: ${quantity} units ${action.toLowerCase()}`
      : `${itemName} ${action.toLowerCase()} successfully`;
    
    toast.success(`Inventory ${action}`, {
      description,
      duration: 3000,
    });
  },

  // Restock Requests
  restockRequestSubmitted: (itemCount: number) => {
    toast.success("Restock Request Submitted", {
      description: `Request for ${itemCount} item${itemCount > 1 ? 's' : ''} has been sent to suppliers`,
      duration: 4000,
    });
  },

  // Orders
  orderStatusUpdate: (orderId: string, status: string) => {
    const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
    toast.info("Order Status Updated", {
      description: `Order #${orderId} is now ${statusDisplay}`,
      duration: 4000,
    });
  },

  // Role Access
  roleAccess: (role: string, feature: string) => {
    toast.info(`${role} Dashboard`, {
      description: `Accessing ${feature} with ${role.toLowerCase()} privileges`,
      duration: 3000,
    });
  },

  // System Messages
  systemMaintenance: () => {
    toast.warning("System Maintenance", {
      description: "Some features may be temporarily unavailable during maintenance",
      duration: 8000,
    });
  },

  // Promise toast for automatic loading/success/error handling
  promise: <T,>(
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

// Example usage for different scenarios:
/*
// Login success
toastUtils.loginSuccess("manager", "John Doe");

// Login error
toastUtils.loginError("auth/wrong-password");

// Data loading
toastUtils.dataLoaded("inventory items", 150);

// Form submission
toastUtils.formSuccess("Created", "New Product");

// Validation error
toastUtils.validationError("Missing required fields", "Please fill in all required information");

// Permission error
toastUtils.permissionError("delete this item");

// Inventory update
toastUtils.inventoryUpdate("Added", "Wireless Mouse", 25);

// Restock request
toastUtils.restockRequestSubmitted(5);

// Order status
toastUtils.orderStatusUpdate("ORD-12345", "shipped");

// Promise handling
toastUtils.promise(fetchData(), {
  loading: "Loading data...",
  success: (data) => `Loaded ${data.length} items`,
  error: "Failed to load data"
});
*/
