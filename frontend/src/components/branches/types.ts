export interface Branch {
  id: string;
  name: string;
  managerCount: number;
  staffCount: number;
  managers: string[]; // Track manager emails
  location?: string;
  contactNumber?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export interface BranchModalState {
  showAddManagerModal: boolean;
  showRemoveManagerModal: boolean;
  showDeleteModal: boolean;
  selectedBranch: Branch | null;
  managerEmail: string;
  selectedManagerEmail: string;
  isProcessing: boolean;
}

export interface BranchFilters {
  searchTerm: string;
}

export type BranchAction =
  | "addManager"
  | "removeManager"
  | "login"
  | "delete"
  | "createManager";

export interface BranchActionEvent {
  action: BranchAction;
  branch: Branch;
  data?: any;
}
