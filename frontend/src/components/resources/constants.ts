export const RESOURCE_CONSTANTS = {
  colors: {
    primary: "#3674B5",
    success: "#10B981",
    warning: "#FADA7A",
    error: "#EF4444",
    gray: "#6B7280",
  },

  labels: {
    resourceName: "Resource Name",
    resourceDetails: "Resource Details",
    staffEmail: "Staff Email",
    staffName: "Staff Name",
    phoneNumber: "Phone Number",
    purpose: "Purpose",
    startDate: "Start Date",
    endDate: "End Date",
    timeRange: "Time Range",
    status: "Status",
    actions: "Actions",
  },

  messages: {
    addNewResource: "Add New Resource",
    assignResource: "Assign Resource",
    deleteResource: "Delete Resource",
    unassignResource: "Unassign Resource",
    resourceAdded: "Resource added successfully!",
    confirmDelete: "Are you sure you want to delete this resource?",
    confirmUnassign: "Are you sure you want to unassign this resource?",
    noResourcesFound: "No resources found",
    noAssignedResources: "No assigned resources",
    autoFilledFromDatabase: "Auto-filled from database",
  },

  placeholders: {
    searchResources: "Search resources by name or details...",
    searchAssignments:
      "Search assigned resources by name, purpose, or staff...",
    resourceName: "Enter resource name (e.g., Delivery Truck - ABC-123)",
    resourceDetails: "Enter resource details and specifications",
    staffEmail: "Enter staff email",
    assignmentPurpose: "Enter assignment purpose",
  },

  statuses: {
    available: "Available",
    assigned: "Assigned",
  },

  tabs: {
    allResources: "All Resources",
    assignedResources: "Assigned Resources",
  },

  buttons: {
    addResource: "Add Resource",
    assign: "Assign Resource",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete",
    unassign: "Unassign",
  },

  // Mock staff database for development
  mockStaffDatabase: [
    {
      email: "john.doe@example.com",
      name: "John Doe",
      phone: "+94 77 123 4567",
    },
    {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      phone: "+94 77 234 5678",
    },
    {
      email: "mike.wilson@example.com",
      name: "Mike Wilson",
      phone: "+94 77 345 6789",
    },
    {
      email: "sarah.brown@example.com",
      name: "Sarah Brown",
      phone: "+94 77 456 7890",
    },
    {
      email: "david.lee@example.com",
      name: "David Lee",
      phone: "+94 77 567 8901",
    },
  ],

  // Sample resources for development
  sampleResources: [
    {
      id: 1,
      name: "Delivery Lorry - ABC-1234",
      details:
        "Large delivery truck, 5-ton capacity, suitable for cement and bulk materials",
      isAvailable: true,
    },
    {
      id: 2,
      name: "Pickup Truck - XYZ-5678",
      details:
        "Medium pickup truck, 2-ton capacity, ideal for tools and small deliveries",
      isAvailable: true,
    },
    {
      id: 3,
      name: "Van - DEF-9012",
      details:
        "Cargo van, 1-ton capacity, perfect for hardware and equipment transport",
      isAvailable: false,
    },
    {
      id: 4,
      name: "Forklift - FL-001",
      details:
        "Electric forklift, 3-ton lifting capacity, warehouse operations",
      isAvailable: true,
    },
  ],

  // Sample assignments for development
  sampleAssignments: [
    {
      id: 1,
      resourceId: 3,
      resourceName: "Van - DEF-9012",
      email: "john.doe@example.com",
      staffName: "John Doe",
      phone: "+94 77 123 4567",
      purpose: "Customer delivery to Kandy region",
      startDate: "2025-08-27",
      endDate: "2025-08-28",
      startTime: "09:00",
      endTime: "17:00",
    },
  ],
};
