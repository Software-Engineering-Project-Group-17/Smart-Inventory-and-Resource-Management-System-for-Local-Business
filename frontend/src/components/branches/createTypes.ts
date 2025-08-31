export interface BranchFormData {
  name: string;
  location: string;
  contactNumber: string;
  description: string;
}

export interface BranchFormErrors {
  name?: string;
  location?: string;
  contactNumber?: string;
  description?: string;
}

export type SubmitStatus = "idle" | "success" | "error";
