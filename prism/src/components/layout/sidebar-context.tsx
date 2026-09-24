"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "prism_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false);

  // Restore user's collapsed preference from localStorage without SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsedState(saved === "true");
      }
    } catch {
      // localStorage may not be available in strict iframe/sandbox modes
    }
  }, []);

  const setCollapsed = (val: boolean) => {
    setIsCollapsedState(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // ignore
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        // Only toggle if user is not currently typing in an input/textarea
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;

        e.preventDefault();
        setIsCollapsedState((prev) => {
          const next = !prev;
          try {
            localStorage.setItem(STORAGE_KEY, String(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
