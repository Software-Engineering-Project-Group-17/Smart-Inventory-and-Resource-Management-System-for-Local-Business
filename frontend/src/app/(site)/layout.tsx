import Navbar from "@/components/ui/navbar";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
