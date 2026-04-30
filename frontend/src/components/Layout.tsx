"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./ui/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md antialiased">
      {/* Absolute Background Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-surface to-surface-container-low opacity-50 pointer-events-none"></div>

      <Sidebar>
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 relative z-10">
          <div className="max-w-screen-xl mx-auto">{children}</div>
        </div>
      </Sidebar>
    </div>
  );
}
