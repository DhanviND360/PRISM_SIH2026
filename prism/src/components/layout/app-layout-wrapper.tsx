"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: AppLayoutWrapperProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`app-container ${isCollapsed ? "app-sidebar-collapsed" : ""}`}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();

  // The landing page ("/") is a standalone public portal layout without dashboard sidebar/topbar
  const isPublicLandingPage = pathname === "/" || pathname === "/landing";

  if (isPublicLandingPage) {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SidebarProvider>
  );
}
