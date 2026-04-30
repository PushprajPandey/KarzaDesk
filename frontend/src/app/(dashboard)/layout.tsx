"use client";

import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ProtectedRoute
      allowedRoles={[
        "admin",
        "sales",
        "sanction",
        "disbursement",
        "collection",
      ]}
    >
      {children}
    </ProtectedRoute>
  );
}
