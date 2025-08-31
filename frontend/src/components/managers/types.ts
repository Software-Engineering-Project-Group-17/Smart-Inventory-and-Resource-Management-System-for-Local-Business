export interface ManagerFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
}

export type SubmitStatus = "idle" | "success" | "error";

export interface CreateManagerProps {
  branchId: string;
  branchName: string;
}

export interface ManagerFormProps {
  formData: ManagerFormData;
  errors: Partial<ManagerFormData>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onGeneratePassword: () => void;
}

export interface ManagerHeaderProps {
  branchName: string;
  currentUserEmail: string | null;
  onBack: () => void;
}

export interface ManagerStatusProps {
  status: SubmitStatus;
}

export interface ManagerActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
