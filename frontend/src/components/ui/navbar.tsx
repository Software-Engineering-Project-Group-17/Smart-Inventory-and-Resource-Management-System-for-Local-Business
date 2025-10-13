"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Building2,
  FileBarChart,
  LogOut,
  Package,
  Users,
  Truck,
  Settings,
  BarChart3,
  User,
  ShoppingCart,
  Archive,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUserProfile, clearAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toastUtils } from "@/lib/toast-utils";
import NotificationComponent from "./notification";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    toastUtils.logoutSuccess();
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
            label: "analytics",
            href: "/analytics",
            icon: <BarChart3 size={20} />,
          },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "MANAGER":
      case "BRANCH_MANAGER":
        return [
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Package size={20} />,
          },
          { label: "Orders", href: "/orders", icon: <Package size={20} /> },
          { label: "Staff", href: "/staff", icon: <Users size={20} /> },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "analytics",
            href: "/analytics",
            icon: <BarChart3 size={20} />,
          },
          {
            label: "Resources",
            href: "/resources",
            icon: <Settings size={20} />,
          },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "SALES_MANAGER":
        return [
          { label: "Sales", href: "/sales", icon: <ShoppingCart size={20} /> },
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
            label: "analytics",
            href: "/analytics",
            icon: <BarChart3 size={20} />,
          },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "INVENTORY_MANAGER":
        return [
          {
            label: "Inventory",
            href: "/inventory",
            icon: <Archive size={20} />,
          },
          {
            label: "Reports",
            href: "/reports",
            icon: <FileBarChart size={20} />,
          },
          {
            label: "analytics",
            href: "/analytics",
            icon: <BarChart3 size={20} />,
          },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
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
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "STAFF":
        return [
          { label: "Sales", href: "/sales", icon: <Receipt size={20} /> },
          { label: "Orders", href: "/orders", icon: <Package size={20} /> },
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
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "SUPPLIER":
        return [
          { label: "Products", href: "/products", icon: <Package size={20} /> },
          {
            label: "Orders",
            href: "/orders",
            icon: <ShoppingCart size={20} />,
          },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      case "CUSTOMER":
        return [
          { label: "Shop", href: "/shop", icon: <ShoppingCart size={20} /> },
          { label: "Orders", href: "/orders", icon: <Package size={20} /> },
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];

      default:
        return [
          { label: "Profile", href: "/profile", icon: <User size={20} /> },
        ];
    }
  };

  const navItems = getNavItems();
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-[#3674B5]">
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
              <div className="ml-10 flex items-baseline space-x-4 overflow-hidden">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {userProfile?.role.toUpperCase() !== "OWNER" && (
                <NotificationComponent userEmail={userProfile?.email || ""} />
              )}

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
            <img src="/logo.png" alt="Company Logo" className="h-12 w-auto" />
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
            {userProfile?.role.toUpperCase() !== "OWNER" && (
              <NotificationComponent
                userEmail={userProfile?.email || ""}
                onMobileMenuClose={() => setIsMobileMenuOpen(false)}
              />
            )}

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
    </>
  );
};

export default Navbar;
