import { useState, useEffect } from "react";
import { StaffMember, NotificationState, NewStaffMember } from "./types";

export const useStaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const uid = localStorage.getItem("uid");
      console.log("🔍 DEBUG - UID from localStorage:", uid);

      if (!uid) {
        showNotification("Please log in as a manager to view staff", "error");
        setLoading(false);
        return;
      }

      const apiUrl = `http://localhost:8084/api/roles/staff/manager/${uid}`;
      console.log("🔍 DEBUG - API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔍 DEBUG - Response status:", response.status);
      console.log("🔍 DEBUG - Response ok:", response.ok);

      if (response.ok) {
        const result = await response.text();
        console.log("🔍 DEBUG - Raw response:", result);
        const parsedResult = JSON.parse(result);
        console.log("🔍 DEBUG - Parsed response:", parsedResult);

        const staffMembers =
          parsedResult.staff?.map((staff: any) => ({
            id: staff.id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phoneNumber || "",
            address: staff.address || "",
            types: staff.staffTypes || ["sales"],
            salary: staff.salary || 0,
            remainingLeave: 21,
            isActive: staff.isActive !== false,
          })) || [];

        setStaff(staffMembers);
        console.log("🔍 DEBUG - Final staff members:", staffMembers);
      } else {
        const errorText = await response.text();
        console.log("🔍 DEBUG - Error response:", errorText);
        showNotification("Failed to fetch staff data", "error");
      }
    } catch (error) {
      console.error("🔍 DEBUG - Fetch error:", error);
      showNotification("Failed to load staff data", "error");
      setError("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (newMember: NewStaffMember) => {
    try {
      const uid = localStorage.getItem("uid");

      if (!uid) {
        showNotification("Please log in as a manager to create staff", "error");
        return false;
      }

      const staffTypes = newMember.types.map((type) => type.toUpperCase());

      const createStaffRequest = {
        creatorFirebaseUid: uid,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        password: newMember.password || "defaultPassword123",
        phoneNumber: newMember.phone || "",
        address: newMember.address || "",
        staffTypes: staffTypes,
        salary: newMember.salary || 0,
      };

      const response = await fetch("http://localhost:8084/api/roles/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createStaffRequest),
      });

      const result = await response.text();
      let parsedResult;

      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        parsedResult = {
          message: result,
          status: response.ok ? "success" : "error",
        };
      }

      if (response.ok && parsedResult.status === "success") {
        await fetchStaff();
        showNotification(
          `Staff member created successfully! Welcome ${newMember.firstName} ${newMember.lastName}`,
          "success"
        );
        return true;
      } else {
        showNotification(
          `Failed to create staff: ${parsedResult.message || "Unknown error"}`,
          "error"
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating staff:", error);
      showNotification(
        "Failed to create staff. Please check your connection and try again.",
        "error"
      );
      return false;
    }
  };

  const updateStaff = (updatedMember: StaffMember) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const toggleStaffActive = (id: number) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member
      )
    );
  };

  const removeStaff = (id: number) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff((prev) => prev.filter((member) => member.id !== id));
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    notification,
    showNotification,
    fetchStaff,
    createStaff,
    updateStaff,
    toggleStaffActive,
    removeStaff,
    setNotification,
  };
};
