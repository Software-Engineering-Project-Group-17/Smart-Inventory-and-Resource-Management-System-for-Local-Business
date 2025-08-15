"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminDashboardLinks = [
  {
    id: 0,
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    id: 1,
    name: "Inventory",
    href: "/admin/inventory",
    icon: Package,
    description: "Manage products and stock",
  },
  {
    id: 2,
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "View and manage orders",
  },
  {
    id: 3,
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts",
  },
  {
    id: 4,
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    description: "Analytics and reports",
  },
  {
    id: 5,
    name: "Resources",
    href: "/admin/resources",
    icon: Wrench,
    description: "Resource management",
  },
  {
    id: 6,
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    description: "System notifications",
  },
  {
    id: 7,
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

interface AdminDashboardLinksProps {
  collapsed?: boolean;
  onLinkClick?: () => void;
}

export function AdminDashboardLinks({
  collapsed = false,
  onLinkClick,
}: AdminDashboardLinksProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav className="flex flex-col gap-1 p-3 md:p-2">
      {adminDashboardLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-4 py-4 md:px-3 md:py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative touch-manipulation",
              "hover:bg-primaryColor/20 hover:text-textDark active:bg-primaryColor/30",
              isActive
                ? "bg-primaryColor text-white shadow-sm"
                : "text-textLight hover:text-textDark",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? item.name : undefined}
          >
            <Icon
              size={20}
              className={cn(
                "flex-shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-secondaryColor group-hover:text-textDark"
              )}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm md:text-sm font-medium">
                  {item.name}
                </span>
                <span
                  className={cn(
                    "text-xs opacity-70 truncate leading-tight",
                    isActive ? "text-white/80" : "text-textLight"
                  )}
                >
                  {item.description}
                </span>
              </div>
            )}

            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 md:h-6 bg-white rounded-r-full" />
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-80">{item.description}</div>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
