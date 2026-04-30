"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { useLoan } from "@/hooks/useLoan";

const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function LoanConfigPage(): JSX.Element {
  const router = useRouter();
  const loan = useLoan();

  const [principal, setPrincipal] = useState<number>(100000);
  const [tenureDays, setTenureDays] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);

  const calc = useMemo(
    () => loan.getLiveCalculation(principal, tenureDays),
    [loan, principal, tenureDays],
  );

  const onApply = async () => {
    setError(null);
    try {
      await loan.applyForLoan(principal, tenureDays);
      router.replace("/status");
    } catch {
      setError("Failed to apply for loan");
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h1 className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
          <span
            className="material-symbols-outlined text-primary text-lg sm:text-xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            account_balance
          </span>
          Loan Configuration
        </h1>
        <p className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Adjust amount and tenure to see your repayment
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-4 sm:space-y-6">
          <Slider
            label="Principal"
            min={50000}
            max={500000}
            step={1000}
            value={principal}
            onChange={setPrincipal}
            formatValue={(v) => formatINR(v)}
          />
          <Slider
            label="Tenure"
            min={30}
            max={365}
            step={1}
            value={tenureDays}
            onChange={setTenureDays}
            suffix="days"
          />
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-4 sm:p-5">
          <div className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface mb-3 sm:mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm sm:text-base">
              calculate
            </span>
            Live Calculation
          </div>
          <div className="space-y-2 sm:space-y-3 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface">
            <div className="flex items-center justify-between gap-3">
              <span className="text-on-surface-variant">Principal</span>
              <span className="font-semibold">{formatINR(calc.principal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-on-surface-variant">Interest Rate</span>
              <span className="font-semibold">{calc.interestRate}% p.a.</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-on-surface-variant">Tenure</span>
              <span className="font-semibold">{calc.tenureDays} days</span>
            </div>
            <div className="h-px bg-outline-variant" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-on-surface-variant">Simple Interest</span>
              <span className="font-semibold">
                {formatINR(calc.simpleInterest)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-on-surface-variant">Total Repayment</span>
              <span className="font-semibold text-primary">
                {formatINR(calc.totalRepayment)}
              </span>
            </div>
          </div>
          <Button
            className="mt-4 sm:mt-6 w-full"
            type="button"
            onClick={onApply}
            isLoading={loan.isLoading}
          >
            Apply for Loan
          </Button>
          {error ? (
            <div className="mt-3 bg-error-container text-on-error-container border-l-4 border-error p-3 rounded-r">
              <div className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined mt-0.5 text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  error
                </span>
                <span className="font-body-sm text-body-sm">{error}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.replace("/upload-slip")}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
