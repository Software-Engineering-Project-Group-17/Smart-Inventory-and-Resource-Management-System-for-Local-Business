export const MANAGER_CONSTANTS = {
  labels: {
    pageTitle: "Create Branch Manager",
    branchDetails: "Assigning to Branch",
    email: "Email Address",
    firstName: "First Name",
    lastName: "Last Name",
    password: "Password",
    confirmPassword: "Confirm Password",
    phoneNumber: "Phone Number",
    address: "Address",
    generateRandom: "Generate Random",
    createManager: "Create Manager",
    cancel: "Cancel",
    backToBranches: "Back to Branches",
  },

  placeholders: {
    email: "Enter manager's email address",
    firstName: "Enter first name",
    lastName: "Enter last name",
    password: "Enter a secure password (min 8 characters)",
    confirmPassword: "Confirm the password",
    phoneNumber: "Enter phone number (optional)",
    address: "Enter address (optional)",
  },

  validation: {
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 8 characters long",
    passwordMismatch: "Passwords do not match",
  },

  messages: {
    success: "Manager created successfully!",
    successRedirect: "Redirecting to branches page...",
    error: "Failed to create manager",
    errorRetry: "Please try again or contact support if the problem persists.",
    invalidParams: "Invalid Parameters",
    branchMissing: "Branch information is missing. Redirecting...",
    creatingAs: "Creating as:",
  },

  info: [
    "The manager will be automatically assigned to this branch",
    "They will receive BRANCH_MANAGER role permissions",
    "Share the password securely with the new manager",
    "The manager should change their password on first login",
    "Only owners can create and manage branch managers",
  ],

  styles: {
    primary: "#3674B5",
    secondary: "#FADA7A",
  },
};
