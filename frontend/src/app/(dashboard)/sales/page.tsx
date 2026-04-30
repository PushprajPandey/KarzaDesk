"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Table, type TableColumn } from "@/components/ui/Table";
import type { User } from "@/types";
import { Badge } from "@/components/ui/Badge";

type LeadRow = { user: User; applicationStatus: string };

export default function SalesPage(): JSX.Element {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.sales.listLeads();
        setRows(data);
      } catch (error) {
        console.error("Failed to load leads:", error);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const cols = useMemo<TableColumn<LeadRow>[]>(
    () => [
      { header: "Name", key: "name", render: (r) => r.user.fullName },
      { header: "Email", key: "email", render: (r) => r.user.email },
      {
        header: "Registered Date",
        key: "date",
        render: (r) => {
          const d = new Date(r.user.createdAt);
          return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
        },
      },
      {
        header: "Application Status",
        key: "status",
        render: (r) => (
          <Badge variant="incomplete">{r.applicationStatus}</Badge>
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
            person_search
          </span>
          Sales Leads
        </div>
        <div className="mt-1 sm:mt-2 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
          Borrowers who have not completed an application
        </div>
      </div>
      <Table
        columns={cols}
        rows={rows}
        isLoading={isLoading}
        emptyText="No pending leads"
      />
    </div>
  );
}
