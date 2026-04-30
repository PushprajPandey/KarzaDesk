"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...rest
}: Props): JSX.Element {
  const generatedId = React.useId();
  const inputId = id ?? rest.name ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block font-label-sm text-label-sm text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <input
        {...rest}
        id={inputId}
        className={
          "w-full px-4 py-3 rounded-lg border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 font-body-md text-body-md transition-colors placeholder:text-outline " +
          (error
            ? "border-error focus:border-error focus:ring-error"
            : "border-outline-variant focus:border-primary focus:ring-primary") +
          (className ? ` ${className}` : "")
        }
      />
      {error && (
        <div className="mt-2 text-body-sm font-body-sm text-error flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px", fontVariationSettings: '"FILL" 1' }}
          >
            error
          </span>
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <div className="mt-2 text-body-sm font-body-sm text-on-surface-variant flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            info
          </span>
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
}
