"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-primary to-secondary text-on-primary hover:opacity-90 active:opacity-100 shadow-sm",
  secondary:
    "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container hover:text-primary shadow-sm",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-primary",
  danger: "bg-error text-on-error hover:bg-error/90 shadow-sm",
};

const sizes = {
  sm: "px-3 py-2 text-label-sm font-label-sm",
  md: "px-4 py-2.5 text-label-md font-label-md",
  lg: "px-6 py-3 text-label-md font-label-md",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className,
  children,
  ...rest
}: Props): JSX.Element {
  const isDisabled = Boolean(disabled || isLoading);
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-60 " +
        styles[variant] +
        " " +
        sizes[size] +
        (className ? ` ${className}` : "")
      }
    >
      {isLoading && (
        <span
          className="material-symbols-outlined animate-spin"
          style={{ fontSize: "20px" }}
        >
          progress_activity
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}
