"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Loan } from "@/types";

const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export default function DisbursementPage(): JSX.Element {
  const [items, setItems] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await api.disbursement.listLoans();
      setItems(data);
    } catch (error) {
      console.error("Failed to load loans:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const disburse = async (id: string) => {
    setError(null);
    try {
      await api.disbursement.disburseLoan(id);
      setConfirmId(null);
      await load();
    } catch {
      setError("Disbursement failed");
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
        header: "Sanctioned Date",
        key: "d",
        render: (r) => {
          const d = new Date(r.createdAt);
          return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
        },
      },
      {
        header: "Summary",
        key: "s",
        render: (r) => (
          <div className="text-xs text-slate-600">
            {r.tenureDays} days at {r.interestRate}%
          </div>
        ),
      },
      {
        header: "Actions",
        key: "a",
        render: (r) => (
          <Button type="button" onClick={() => setConfirmId(r._id)}>
            Disburse
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-4 sm:mb-6">
        <div className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2 sm:gap-3">
          <span
            className="material-symbols-outlined text-primary text-lg sm:text-xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            payments
          </span>
          Disbursement
        </div>
        <div className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Disburse sanctioned loans
        </div>
      </div>

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

      <Table
        columns={cols}
        rows={items}
        isLoading={isLoading}
        emptyText="No sanctioned loans"
      />

      <Modal
        isOpen={Boolean(confirmId)}
        title="Disburse Loan"
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => (confirmId ? void disburse(confirmId) : undefined)}
            >
              Disburse
            </Button>
          </>
        }
      >
        <div className="text-sm text-slate-700">
          Confirm loan disbursement. This will mark the loan as disbursed.
        </div>
      </Modal>
    </div>
  );
}
