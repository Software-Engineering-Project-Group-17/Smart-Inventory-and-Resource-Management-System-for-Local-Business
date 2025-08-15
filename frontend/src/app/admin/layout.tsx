"use client";

import { AdminDashboardLinks } from "@/components/admin/DashboardLinks";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { ReactNode, useState, useEffect } from "react";
import { Menu } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Reset sidebar state on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Header */}
      <div className="w-full h-[60px] bg-primaryColor sticky top-0 flex justify-between items-center px-4 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="handwriting text-lg md:text-xl text-white">
            Our Inventory
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex relative">
        {/* Desktop sidebar */}
        <div className="hidden md:flex h-[calc(100vh-60px)] w-[280px] bg-extraLight border-r border-gray-200 flex-col overflow-hidden">
          <AdminDashboardLinks />
        </div>

        {/* Mobile sidebar */}
        <div
          className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[280px] bg-extraLight border-r border-gray-200 flex-col overflow-hidden z-40 transition-transform duration-300 md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-textDark">Navigation</h2>
            <p className="text-sm text-textLight">
              Choose a section to navigate
            </p>
          </div>
          <AdminDashboardLinks onLinkClick={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 bg-gray-50 min-h-[calc(100vh-60px)] overflow-auto">
          <div className="p-4 md:p-6 pb-20 md:pb-6">{children}</div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onMenuClick={toggleSidebar} />
    </>
  );
}
