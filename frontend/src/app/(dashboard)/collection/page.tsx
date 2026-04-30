"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { Loan } from "@/types";

const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export default function CollectionPage(): JSX.Element {
  const [items, setItems] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await api.collection.listActiveLoans();
      setItems(data);
    } catch (error) {
      console.error("Failed to load active loans:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const open = (loan: Loan) => {
    setActiveLoan(loan);
    setUtrNumber("");
    setAmount("");
    setPaymentDate("");
    setError(null);
    setSuccess(null);
  };

  const close = () => {
    setActiveLoan(null);
    setError(null);
    setSuccess(null);
  };

  const submit = async () => {
    if (!activeLoan) {
      return;
    }
    setError(null);
    setSuccess(null);

    const a = Number(amount);
    if (!utrNumber.trim()) {
      setError("UTR Number is required");
      return;
    }
    if (!Number.isFinite(a) || a <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (a > activeLoan.outstandingBalance) {
      setError("Amount cannot exceed outstanding balance");
      return;
    }
    if (!paymentDate) {
      setError("Payment date is required");
      return;
    }

    try {
      const result = await api.collection.recordPayment(activeLoan._id, {
        utrNumber: utrNumber.trim(),
        amount: a,
        paymentDate,
      });
      await load();
      setSuccess(result.isClosed ? "Loan Closed" : "Payment Recorded");
    } catch (e) {
      const err = e as { status?: number; data?: unknown; message?: string };
      const apiMsg =
        err?.data && typeof err.data === "object" && "message" in err.data
          ? String((err.data as { message: unknown }).message)
          : null;
      setError(apiMsg ?? err?.message ?? "Payment failed");
    }
  };

  const cols = useMemo<TableColumn<Loan>[]>(
    () => [
      {
        header: "Borrower Name",
        key: "name",
        render: (r) => {
          const u = r.userId as unknown as { fullName?: string };
          return u?.fullName ? String(u.fullName) : "-";
        },
      },
      { header: "Principal", key: "p", render: (r) => formatINR(r.principal) },
      {
        header: "Total Repayment",
        key: "t",
        render: (r) => formatINR(r.totalRepayment),
      },
      {
        header: "Amount Paid",
        key: "ap",
        render: (r) => formatINR(r.amountPaid),
      },
      {
        header: "Outstanding",
        key: "o",
        render: (r) => formatINR(r.outstandingBalance),
      },
      {
        header: "Status",
        key: "s",
        render: (r) => (
          <Badge variant={r.outstandingBalance <= 0 ? "closed" : r.status}>
            {r.outstandingBalance <= 0 ? "closed" : r.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        key: "a",
        render: (r) => (
          <Button type="button" onClick={() => open(r)}>
            Record Payment
          </Button>
        ),
      },
    ],
    [],
  );

  const max = activeLoan ? activeLoan.outstandingBalance : 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-4 sm:mb-6">
        <div className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
          <span
            className="material-symbols-outlined text-primary text-lg sm:text-xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            receipt_long
          </span>
          Collection
        </div>
        <div className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Record payments and close loans automatically
        </div>
      </div>

      <Table
        columns={cols}
        rows={items}
        isLoading={isLoading}
        emptyText="No active loans"
      />

      <Modal
        isOpen={Boolean(activeLoan)}
        title="Record Payment"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={close}>
              Close
            </Button>
            <Button type="button" onClick={submit}>
              Save Payment
            </Button>
          </>
        }
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant p-3 sm:p-4 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-on-surface-variant">
                Outstanding
              </span>
              <span className="font-bold text-primary">{formatINR(max)}</span>
            </div>
          </div>

          <Input
            label="UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
          />
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            max={max}
            helperText={max ? `Max allowed: ${formatINR(max)}` : undefined}
          />
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          {error ? (
            <div className="bg-error-container text-on-error-container border-l-4 border-error p-3 rounded-r">
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
          {success ? (
            <div className="bg-primary-container text-on-primary-container border-l-4 border-primary p-3 rounded-r">
              <div className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined mt-0.5 text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check_circle
                </span>
                <span className="font-body-sm text-body-sm">{success}</span>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
