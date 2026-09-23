"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();

  // The landing page ("/") is a standalone public portal layout without dashboard sidebar/topbar
  const isPublicLandingPage = pathname === "/" || pathname === "/landing";

  if (isPublicLandingPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
