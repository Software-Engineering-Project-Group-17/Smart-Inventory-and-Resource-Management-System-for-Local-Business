export interface ManagerFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
}

export interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  address?: string;
}

export type SubmitStatus = "idle" | "success" | "error";

export interface PasswordVisibility {
  showPassword: boolean;
  showConfirmPassword: boolean;
}
