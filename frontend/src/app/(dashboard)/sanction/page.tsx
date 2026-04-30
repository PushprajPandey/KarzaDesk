"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { Application } from "@/types";

type Row = Application;

export default function SanctionPage(): JSX.Element {
  const [items, setItems] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await api.sanction.listApplications(1, 50);
      setItems(data.items);
    } catch (error) {
      console.error("Failed to load applications:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    setError(null);
    try {
      await api.sanction.approveApplication(id);
      setConfirmId(null);
      await load();
    } catch {
      setError("Approval failed");
    }
  };

  const reject = async (id: string) => {
    setError(null);
    const r = reason.trim();
    if (!r) {
      setError("Rejection reason is required");
      return;
    }
    try {
      await api.sanction.rejectApplication(id, r);
      setRejectId(null);
      setReason("");
      await load();
    } catch {
      setError("Rejection failed");
    }
  };

  const cols = useMemo<TableColumn<Row>[]>(
    () => [
      {
        header: "Borrower Name",
        key: "name",
        render: (r) => {
          const u = r.userId as unknown as { fullName?: string };
          return u?.fullName ? String(u.fullName) : r.fullName;
        },
      },
      { header: "PAN", key: "pan", render: (r) => r.pan },
      { header: "Salary", key: "salary", render: (r) => `₹${r.monthlySalary}` },
      { header: "Employment", key: "emp", render: (r) => r.employmentMode },
      {
        header: "Applied Date",
        key: "date",
        render: (r) => {
          const d = new Date(r.createdAt);
          return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
        },
      },
      {
        header: "Status",
        key: "status",
        render: (r) => <Badge variant={r.status}>{r.status}</Badge>,
      },
      {
        header: "Actions",
        key: "actions",
        render: (r) => (
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setConfirmId(r._id)}>
              Approve
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={() => setRejectId(r._id)}
            >
              Reject
            </Button>
          </div>
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
            account_balance
          </span>
          Sanction
        </div>
        <div className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Review applications and approve or reject
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
        emptyText="No applied applications"
      />

      <Modal
        isOpen={Boolean(confirmId)}
        title="Approve Application"
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
              onClick={() => (confirmId ? void approve(confirmId) : undefined)}
            >
              Approve
            </Button>
          </>
        }
      >
        <div className="text-sm text-slate-700">
          Are you sure you want to approve this application?
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(rejectId)}
        title="Reject Application"
        onClose={() => {
          setRejectId(null);
          setReason("");
        }}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setRejectId(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={() => (rejectId ? void reject(rejectId) : undefined)}
            >
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-700">
            Provide a rejection reason (required).
          </div>
          <Input
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
