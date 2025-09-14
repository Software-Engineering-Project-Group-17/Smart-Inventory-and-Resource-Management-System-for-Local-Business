import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type:
    | "low_stock"
    | "restock_completion"
    | "stock_update"
    | "system";
  is_read: boolean;
  created_at: string;
  inventory_id?: number;
  metadata?: any;
  inventory_name?: string;
  current_quantity?: number;
  low_stock_threshold?: number;
}

export interface NotificationsData {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  branchId: string;
}

export const useNotifications = (userEmail: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/notifications?userEmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data: NotificationsData = await response.json();

      if (data.success !== false) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  const markAsRead = useCallback(
    async (notificationIds: number[]) => {
      if (!userEmail || notificationIds.length === 0) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationIds,
            userEmail,
          }),
        });

        if (response.ok) {
          // Update local state to mark notifications as read
          setNotifications((prev) =>
            prev.map((notification) =>
              notificationIds.includes(notification.id)
                ? { ...notification, is_read: true }
                : notification
            )
          );

          // Update unread count
          setUnreadCount((prev) => {
            const markedCount = notifications.filter(
              (n) => notificationIds.includes(n.id) && !n.is_read
            ).length;
            return Math.max(0, prev - markedCount);
          });
        } else {
          console.error("Failed to mark notifications as read");
        }
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    },
    [userEmail, notifications]
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return "⚠️";
      case "restock_completion":
        return "📦";
      case "stock_update":
        return "🔄";
      case "system":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "low_stock":
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          text: "text-red-700",
        };
      case "restock_completion":
        return {
          bg: "bg-green-50",
          border: "border-green-500",
          text: "text-green-700",
        };
      case "stock_update":
        return {
          bg: "bg-blue-50",
          border: "border-blue-500",
          text: "text-blue-700",
        };
      case "system":
        return {
          bg: "bg-gray-50",
          border: "border-gray-500",
          text: "text-gray-700",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-500",
          text: "text-blue-700",
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  };

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
  };
};
