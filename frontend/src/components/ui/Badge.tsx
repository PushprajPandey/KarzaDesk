"use client";

import React from "react";
import type { ApplicationStatus, LoanStatus } from "@/types";

type Variant = ApplicationStatus | LoanStatus | "pending";

const styles: Record<string, string> = {
  pending: "bg-surface-variant text-on-surface-variant",
  incomplete: "bg-surface-variant text-on-surface-variant",
  applied: "bg-secondary-container text-on-secondary-container",
  sanctioned: "bg-primary-container text-on-primary-container",
  rejected: "bg-error-container text-on-error-container",
  disbursed: "bg-tertiary-container text-on-tertiary-container",
  closed: "bg-surface-container-high text-on-surface",
};

interface BadgeProps {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant,
  children,
  className = "",
}: BadgeProps): JSX.Element {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm border border-outline-variant";
  const variantClasses = styles[variant] ?? styles.pending;

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`.trim()}>
      {children}
    </span>
  );
}
