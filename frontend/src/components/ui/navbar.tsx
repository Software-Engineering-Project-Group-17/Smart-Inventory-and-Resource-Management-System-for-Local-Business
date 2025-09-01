"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Building2,
  FileBarChart,
  Plus,
  LogOut,
  Bell,
  Package,
  Users,
  Truck,
  Settings,
  User,
  ShoppingCart,
  Archive,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUserProfile, getUserRole, clearAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Get user profile on component mount and when it changes
  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  // Handle logout functionality
  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  const getNavItems = (): NavItem[] => {
    if (!userProfile?.role) return [];

    const role = userProfile.role.toUpperCase();

    switch (role) {
      case "OWNER":
        return [
          {
            label: "Branches",
            href: "/branches",
            icon: <Building2 size={20} />,
          },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "MANAGER":
      case "BRANCH_MANAGER":
        return [
          {
            label: "Branches",
            href: "/branches",
            icon: <Building2 size={20} />,
          },
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Package size={20} />,
          },
          {
            label: "Staff",
            href: "/staff",
            icon: <Users size={20} />,
          },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "Suppliers",
            href: "/suppliers",
            icon: <Truck size={20} />,
          },
          {
            label: "Resources",
            href: "/resources",
            icon: <Settings size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "SALES_MANAGER":
        return [
          {
            label: "Sales",
            href: "/sales",
            icon: <ShoppingCart size={20} />,
          },
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Package size={20} />,
          },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "INVENTORY_MANAGER":
        return [
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Archive size={20} />,
          },
          {
            label: "Suppliers",
            href: "/suppliers",
            icon: <Truck size={20} />,
          },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "RESOURCE_MANAGER":
        return [
          {
            label: "Resources",
            href: "/resources",
            icon: <Settings size={20} />,
          },
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Package size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "STAFF":
        return [
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Archive size={20} />,
          },
          {
            label: "Resources",
            href: "/resources",
            icon: <Settings size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "SUPPLIER":
        return [
          {
            label: "Products",
            href: "/products",
            icon: <Package size={20} />,
          },
          {
            label: "Orders",
            href: "/orders",
            icon: <ShoppingCart size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      case "CUSTOMER":
        return [
          {
            label: "Shop",
            href: "/shop",
            icon: <ShoppingCart size={20} />,
          },
          {
            label: "Orders",
            href: "/orders",
            icon: <Package size={20} />,
          },
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];

      default:
        return [
          {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
          },
        ];
    }
  };

  const navItems = getNavItems();
  const alertCount = 3; // Example alert count

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
            <button
              onClick={() => setShowAlertModal(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-700">
                    New inventory update available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                </div>
                <div
                  className="p-3 rounded-lg border-l-4 hover:bg-yellow-50 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#FADA7A20",
                    borderLeftColor: "#FADA7A",
                  }}
                >
                  <p className="text-sm text-gray-700">
                    Weekly report is ready for review
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-700">
                    New supplier added successfully
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-gray-100">
            <button
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
            <button
              onClick={() => setShowAlertModal(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">
                  New inventory update available
                </p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
              <div
                className="p-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: "#FADA7A20",
                  borderLeftColor: "#FADA7A",
                }}
              >
                <p className="text-sm text-gray-700">
                  Weekly report is ready for review
                </p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-700">
                  New supplier added successfully
                </p>
                <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className="bg-white shadow-lg sticky top-0"
        style={{ borderBottom: `2px solid #3674B5` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo.png"
                  alt="Build Mate"
                  className="h-15 w-auto"
                  width={120}
                  height={120}
                />
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:scale-105 transition-transform duration-200"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Alert Bell */}
              <div className="relative">
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
                  {alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {alertCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200"
                style={{ backgroundColor: "#3674B5" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3674B5";
                }}
              >
                <LogOut size={16} />
                <span className="ml-2">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                style={{
                  color: isMobileMenuOpen ? "#3674B5" : "#6B7280",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3674B5";
                }}
                onMouseLeave={(e) => {
                  if (!isMobileMenuOpen) {
                    e.currentTarget.style.color = "#6B7280";
                  }
                }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay with Blur Effect */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out z-50 md:hidden shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <img
              src="/api/placeholder/100/32"
              alt="Company Logo"
              className="h-6 w-auto"
            />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600"
              style={{ color: "#3674B5" }}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-white transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3674B5";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "#374151";
                }}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* Alert Button Mobile */}
            <button
              onClick={() => {
                setShowAlertModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-white transition-colors duration-200 mb-2"
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
              {alertCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Logout Button Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-white transition-colors duration-200"
              style={{ backgroundColor: "#3674B5" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3674B5";
              }}
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Dropdown for Desktop */}
      <div className="hidden md:block">
        <AlertDropdown />
      </div>

      {/* Alert Modal for Mobile */}
      <MobileAlertModal />
    </>
  );
};

export default Navbar;
