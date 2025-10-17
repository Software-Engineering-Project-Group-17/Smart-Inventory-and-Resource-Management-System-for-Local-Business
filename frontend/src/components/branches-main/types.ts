export interface Branch {
  id: string;
  name: string;
  managerCount: number;
  staffCount: number;
  managers: string[];
  location?: string;
  contactNumber?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export interface BranchesHeaderProps {
  currentUserEmail: string | null;
}

export interface BranchesFiltersProps {
  searchTerm: string;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onRefresh: () => void;
  onAddBranch: () => void;
}

export interface BranchesTableProps {
  branches: Branch[];
  isLoading: boolean;
  searchTerm: string;
  onCreateManager: (branchId: string, branchName: string) => void;
  onRemoveManager: (branch: Branch) => void;
  onLogin: (branchId: string) => void;
  onDelete: (branch: Branch) => void;
  onViewUsers: (branchId: string, branchName: string) => void;
}

export interface BranchesErrorProps {
  error: string | null;
  onRetry: () => void;
}
