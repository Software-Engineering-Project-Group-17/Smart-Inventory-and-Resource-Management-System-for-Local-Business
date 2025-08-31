// Constants for staff management
import { StaffType } from "./types";

export const STAFF_TYPES: StaffType[] = [
  { id: "sales", name: "Sales", color: "#3674B5" },
  { id: "inventory", name: "Inventory", color: "#FADA7A" },
  { id: "resources", name: "Resources", color: "#10B981" },
];

export const getTypeColor = (typeId: string) => {
  return STAFF_TYPES.find((t) => t.id === typeId)?.color || "#6B7280";
};

export const getTypeName = (typeId: string) => {
  return STAFF_TYPES.find((t) => t.id === typeId)?.name || typeId;
};

export const getTypeInitials = (typeId: string) => {
  const initials = {
    sales: "S",
    inventory: "I",
    resources: "R",
  };
  return (
    initials[typeId as keyof typeof initials] || typeId.charAt(0).toUpperCase()
  );
};
