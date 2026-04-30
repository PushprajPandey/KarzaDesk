"use client";

import React, { useEffect } from "react";
import { StatusStepper } from "@/components/ui/StatusStepper";
import { Badge } from "@/components/ui/Badge";
import { useLoan } from "@/hooks/useLoan";
import { Logo } from "@/components/ui/Logo";

const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export default function StatusPage(): JSX.Element {
  const loan = useLoan();

  useEffect(() => {
    void loan.fetchMyApplication();
  }, [loan.fetchMyApplication]);

  if (loan.isLoading && !loan.application) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined animate-spin text-primary"
            style={{ fontSize: "32px" }}
          >
            progress_activity
          </span>
          <span className="font-body-lg text-body-lg text-on-surface-variant">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const app = loan.application;
  const l = loan.loan;

  if (!app) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="text-center">
          <Logo
            size={48}
            className="mx-auto mb-3 sm:mb-4 shadow-sm sm:w-16 sm:h-16"
          />
          <h1 className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface mb-1 sm:mb-2">
            Welcome!
          </h1>
          <p className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant mb-4 sm:mb-6">
            Let's start your loan application journey.
          </p>
          <button
            onClick={() => (window.location.href = "/personal-details")}
            className="bg-gradient-to-br from-primary to-secondary text-on-primary font-label-sm sm:font-label-md text-label-sm sm:text-label-md py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 mx-auto"
          >
            <span>Start Application</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
        <div>
          <div className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
            <span
              className="material-symbols-outlined text-primary text-lg sm:text-xl"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              dashboard
            </span>
            <span>Application Status</span>
          </div>
          <div className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
            Track your loan journey
          </div>
        </div>
        <Badge
          variant={app.status}
          className="text-label-sm sm:text-label-md font-label-sm sm:font-label-md px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm self-start lg:self-center"
        >
          {app.status.toUpperCase()}
        </Badge>
      </div>

      <div className="mt-6">
        <StatusStepper status={app.status} />
      </div>

      {app.status === "rejected" && app.rejectionReason && (
        <div className="mt-4 sm:mt-6 bg-error-container text-on-error-container border-l-4 border-error p-3 sm:p-4 rounded-r">
          <div className="flex items-start gap-2 sm:gap-3">
            <span
              className="material-symbols-outlined mt-0.5 text-sm sm:text-base"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              error
            </span>
            <div>
              <div className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md">
                Rejection Reason
              </div>
              <div className="mt-1 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm">
                {app.rejectionReason}
              </div>
            </div>
          </div>
        </div>
      )}

      {l && (
        <div className="mt-4 sm:mt-6 bg-surface-container rounded-xl border border-outline-variant p-4 sm:p-6">
          <div className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface mb-3 sm:mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm sm:text-base">
              account_balance
            </span>
            Loan Details
          </div>
          <div className="grid gap-2 sm:gap-3 lg:gap-4 text-body-xs sm:text-body-sm font-body-xs sm:font-body-sm text-on-surface grid-cols-1 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Principal</span>
              <span className="font-semibold text-on-surface">
                {formatINR(l.principal)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Tenure</span>
              <span className="font-semibold text-on-surface">
                {l.tenureDays} days
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Interest</span>
              <span className="font-semibold text-on-surface">
                {formatINR(l.simpleInterest)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Total Repayment</span>
              <span className="font-semibold text-on-surface">
                {formatINR(l.totalRepayment)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Amount Paid</span>
              <span className="font-semibold text-primary">
                {formatINR(l.amountPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-container-lowest rounded-lg">
              <span className="text-on-surface-variant">Outstanding</span>
              <span className="font-semibold text-on-surface">
                {formatINR(l.outstandingBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-end">
        <button
          type="button"
          onClick={() => (window.location.href = "/personal-details")}
          className="bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container hover:text-primary font-label-sm sm:font-label-md text-label-sm sm:text-label-md py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 justify-center"
        >
          <span className="material-symbols-outlined text-sm sm:text-base">
            edit
          </span>
          <span>Update Details</span>
        </button>
        <button
          type="button"
          onClick={() => void loan.fetchMyApplication()}
          disabled={loan.isLoading}
          className="bg-gradient-to-br from-primary to-secondary text-on-primary font-label-sm sm:font-label-md text-label-sm sm:text-label-md py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loan.isLoading ? (
            <>
              <span
                className="material-symbols-outlined animate-spin text-sm sm:text-base"
                style={{ fontSize: "18px" }}
              >
                progress_activity
              </span>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm sm:text-base">
                refresh
              </span>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
