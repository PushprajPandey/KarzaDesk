"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLoan } from "@/hooks/useLoan";
import type { EmploymentMode, PersonalDetailsInput } from "@/types";

const modes: { value: EmploymentMode; label: string }[] = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
];

export default function PersonalDetailsPage(): JSX.Element {
  const router = useRouter();
  const loan = useLoan();

  const [fullName, setFullName] = useState<string>("");
  const [pan, setPan] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [monthlySalary, setMonthlySalary] = useState<string>("");
  const [employmentMode, setEmploymentMode] =
    useState<EmploymentMode>("salaried");

  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if user already has an application and redirect accordingly
  useEffect(() => {
    const checkApplication = async () => {
      try {
        await loan.fetchMyApplication();
        if (loan.application) {
          // If user has an application, redirect to appropriate page
          if (loan.application.status === "incomplete") {
            // Stay on this page and populate the form
            setFullName(loan.application.fullName || "");
            setPan(loan.application.pan || "");
            setDateOfBirth(
              loan.application.dateOfBirth
                ? new Date(loan.application.dateOfBirth)
                    .toISOString()
                    .split("T")[0]
                : "",
            );
            setMonthlySalary(loan.application.monthlySalary?.toString() || "");
            setEmploymentMode(loan.application.employmentMode || "salaried");
          } else {
            // If application is complete, redirect to status page
            router.replace("/status");
          }
        }
      } catch (error) {
        console.error("Failed to fetch application:", error);
      }
    };

    void checkApplication();
  }, [loan.fetchMyApplication, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreErrors([]);
    setError(null);

    const salaryNum = Number(monthlySalary);

    const payload: PersonalDetailsInput = {
      fullName: fullName.trim(),
      pan: pan.trim().toUpperCase(),
      dateOfBirth,
      monthlySalary: salaryNum,
      employmentMode,
    };

    if (
      !payload.fullName ||
      !payload.pan ||
      !payload.dateOfBirth ||
      !Number.isFinite(payload.monthlySalary)
    ) {
      setError("All fields are required");
      return;
    }

    try {
      await loan.savePersonalDetails(payload);
      router.replace("/upload-slip");
    } catch (e2) {
      const err = e2 as { status?: number; data?: unknown; message?: string };
      if (
        err?.status === 422 &&
        err.data &&
        typeof err.data === "object" &&
        "breErrors" in err.data
      ) {
        const raw = (err.data as { breErrors: unknown }).breErrors;
        if (Array.isArray(raw)) {
          setBreErrors(raw.map((x) => String(x)));
          return;
        }
      }
      setError(err?.message ? String(err.message) : "Failed to save details");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["borrower"]}>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
            <span
              className="material-symbols-outlined text-primary text-lg sm:text-xl"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              person
            </span>
            Personal Details
          </h1>
          <p className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
            Provide your details to check eligibility
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="PAN"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            helperText="Format: ABCDE1234F"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <Input
            label="Monthly Salary"
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            min={0}
          />
          <div className="w-full">
            <label className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">
              Employment Mode
            </label>
            <select
              value={employmentMode}
              onChange={(e) =>
                setEmploymentMode(e.target.value as EmploymentMode)
              }
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors"
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {breErrors.length > 0 ? (
            <div className="bg-error-container text-on-error-container border-l-4 border-error p-3 sm:p-4 rounded-r">
              <div className="flex items-start gap-2 sm:gap-3">
                <span
                  className="material-symbols-outlined mt-0.5 text-sm sm:text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  error
                </span>
                <div>
                  <div className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md">
                    Eligibility errors
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 sm:pl-5 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm">
                    {breErrors.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="bg-error-container text-on-error-container border-l-4 border-error p-3 sm:p-4 rounded-r">
              <div className="flex items-start gap-2 sm:gap-3">
                <span
                  className="material-symbols-outlined mt-0.5 text-sm sm:text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  error
                </span>
                <span className="font-body-sm text-body-sm">{error}</span>
              </div>
            </div>
          ) : null}

          <Button type="submit" isLoading={loan.isLoading} className="w-full">
            Save and Continue
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
