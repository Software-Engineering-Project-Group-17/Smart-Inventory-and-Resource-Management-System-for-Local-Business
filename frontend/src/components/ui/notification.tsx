"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationProps {
  userEmail: string;
  onMobileMenuClose?: () => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({
  userEmail,
  onMobileMenuClose,
}) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Use the notifications hook
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    getNotificationColor,
    formatTimeAgo,
  } = useNotifications(userEmail);

  // Close alert modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showAlertModal &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        const alertModal = document.getElementById("alert-dropdown");
        if (alertModal && !alertModal.contains(event.target as Node)) {
          setShowAlertModal(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAlertModal]);

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      markAsRead([notificationId]);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const AlertDropdown = () => {
    if (!showAlertModal || !bellRef.current) return null;

    const rect = bellRef.current.getBoundingClientRect();
    const top = rect.bottom + 8; // 8px gap below the bell icon
    const right = window.innerWidth - rect.right; // Position from right edge

    return (
      <div
        id="alert-dropdown"
        className="fixed z-50"
        style={{
          top: `${top}px`,
          right: `${right}px`,
          maxWidth: "320px",
          width: "320px",
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <div className="p-2">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 10).map((notification) => {
                    const colors = getNotificationColor(
                      notification.notification_type
                    );
                    return (
                      <div
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(
                            notification.id,
                            notification.is_read
                          )
                        }
                        className={`p-3 rounded-lg border-l-4 hover:opacity-80 transition-colors cursor-pointer ${
                          notification.is_read ? "opacity-60" : ""
                        } ${colors.bg}`}
                        style={{
                          borderLeftColor: colors.border.replace("border-", ""),
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${colors.text}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                setShowAlertModal(false);
                // Could navigate to a full notifications page here
              }}
              className="w-full text-center text-sm font-medium hover:text-white hover:bg-opacity-90 transition-colors duration-200 py-2 rounded-md"
              style={{ color: "#3674B5", backgroundColor: "#3674B510" }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MobileAlertModal = () =>
    showAlertModal && (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 md:hidden">
        <div className="bg-white rounded-lg mx-4 max-w-md w-full max-h-96 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-4">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 10).map((notification) => {
                  const colors = getNotificationColor(
                    notification.notification_type
                  );
                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead([notification.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border-l-4 hover:opacity-80 transition-colors cursor-pointer ${
                        notification.is_read ? "opacity-60" : ""
                      } ${colors.bg}`}
                      style={{
                        borderLeftColor: colors.border.replace("border-", ""),
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${colors.text}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <>
      {/* Desktop Bell Icon */}
      <div className="relative hidden md:block">
        <button
          ref={bellRef}
          onClick={() => setShowAlertModal(!showAlertModal)}
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
          style={{
            color: showAlertModal ? "#3674B5" : "#6B7280",
          }}
          onMouseEnter={(e) => {
            if (!showAlertModal) {
              e.currentTarget.style.color = "#3674B5";
            }
          }}
          onMouseLeave={(e) => {
            if (!showAlertModal) {
              e.currentTarget.style.color = "#6B7280";
            }
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bell Button */}
      <button
        onClick={() => {
          setShowAlertModal(true);
          if (onMobileMenuClose) {
            onMobileMenuClose();
          }
        }}
        className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-white transition-colors duration-200 mb-2 md:hidden"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3674B5";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.color = "#374151";
        }}
      >
        <Bell size={20} />
        <span className="ml-3">Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Alert Dropdown for Desktop */}
      <div className="hidden md:block">
        <AlertDropdown />
      </div>

      {/* Alert Modal for Mobile */}
      <MobileAlertModal />
    </>
  );
};

export default NotificationComponent;
