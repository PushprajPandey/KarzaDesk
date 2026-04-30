"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={["borrower"]}>{children}</ProtectedRoute>
  );
}
