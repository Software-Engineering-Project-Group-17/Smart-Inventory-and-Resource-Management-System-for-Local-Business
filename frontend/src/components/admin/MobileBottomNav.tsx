"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-30">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation",
                isActive
                  ? "text-primaryColor"
                  : "text-gray-600 hover:text-primaryColor"
              )}
            >
              <Icon size={20} />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}

        {/* More menu button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-primaryColor transition-colors touch-manipulation"
        >
          <Menu size={20} />
          <span className="text-xs">More</span>
        </button>
      </div>
    </div>
  );
}
