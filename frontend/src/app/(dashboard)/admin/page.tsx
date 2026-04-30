"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Loan, User } from "@/types";

const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const getInitials = (fullName: string): string => {
  const names = fullName.trim().split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-tertiary-container text-on-tertiary-container",
    "bg-secondary-container text-on-secondary-container",
    "bg-primary-fixed text-on-primary-fixed",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function AdminPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      const result = await api.admin.testConnection();
      setSuccess(`Connection test successful: ${result.message}`);
      setError(null);
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setError(`Connection test failed: ${error?.message || "Unknown error"}`);
      setSuccess(null);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadLoans = async () => {
    setLoadingLoans(true);
    try {
      const data = await api.admin.getAllLoans();
      setLoans(data);
    } catch (error) {
      console.error("Failed to load loans:", error);
      setLoans([]);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadLoans();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName} and all their data? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingUserId(userId);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.admin.deleteUser(userId);
      setSuccess(result.message);
      // Reload users and loans after deletion
      await loadUsers();
      await loadLoans();
    } catch (error: any) {
      console.error("Failed to delete user:", error);

      // Better error handling
      let errorMessage = "Failed to delete user";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-primary-container text-on-primary-container border-l-4 border-primary p-3 sm:p-4 rounded-r">
          <div className="flex items-start gap-2 sm:gap-3">
            <span
              className="material-symbols-outlined mt-0.5 text-sm sm:text-base"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              check_circle
            </span>
            <span className="font-body-sm text-body-sm">{success}</span>
          </div>
        </div>
      )}

      {error && (
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
      )}

      

      {/* Users Section */}
      <section>
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <h2 className="font-h3 text-h3 sm:font-h2 sm:text-h2 text-on-surface flex items-center gap-2">
            Users
            <span className="w-2 h-2 rounded-full bg-primary inline-block mb-1"></span>
          </h2>
        </div>

        {/* Users Table Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-6 sm:py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary text-lg sm:text-xl">
                          progress_activity
                        </span>
                        <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
                          Loading users...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 sm:py-8 text-center">
                      <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
                        No users found
                      </span>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-surface transition-colors duration-150"
                    >
                      <td className="py-2.5 px-4 sm:py-3 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${getAvatarColor(user.fullName)} flex items-center justify-center font-label-sm text-xs`}
                          >
                            {getInitials(user.fullName)}
                          </div>
                          <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface font-medium truncate">
                            {user.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 sm:py-3 sm:px-6 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface-variant truncate">
                        {user.email}
                      </td>
                      <td className="py-2.5 px-4 sm:py-3 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-label-sm ${
                            user.role === "admin"
                              ? "bg-primary-container text-on-primary-container"
                              : "bg-surface-variant text-on-surface-variant border border-outline-variant"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 sm:py-3 sm:px-6 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface-variant">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2.5 px-4 sm:py-3 sm:px-6">
                        {user.role !== "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.fullName)
                            }
                            disabled={deletingUserId === user._id}
                            className="bg-error text-on-error px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-label-sm text-label-sm hover:bg-error/90 transition-colors shadow-sm flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deletingUserId === user._id ? (
                              <>
                                <span className="material-symbols-outlined animate-spin text-xs">
                                  progress_activity
                                </span>
                                <span className="hidden sm:inline">
                                  Deleting...
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-xs">
                                  delete
                                </span>
                                <span className="hidden sm:inline">Delete</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-outline-variant bg-surface-container-lowest flex justify-end">
            <button className="text-primary font-label-sm sm:font-label-md text-label-sm sm:text-label-md hover:underline flex items-center gap-1">
              View All Users{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Loans Section */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="font-h4 text-h4 sm:font-h3 sm:text-h3 text-on-surface">
            Recent Loans
          </h3>
        </div>

        {/* Loans Table Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Principal
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Paid
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Outstanding
                  </th>
                  <th className="py-3 px-4 sm:py-4 sm:px-6 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {loadingLoans ? (
                  <tr>
                    <td colSpan={6} className="py-6 sm:py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary text-lg sm:text-xl">
                          progress_activity
                        </span>
                        <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
                          Loading loans...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 sm:py-8 text-center">
                      <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant">
                        No loans found
                      </span>
                    </td>
                  </tr>
                ) : (
                  loans.slice(0, 3).map((loan) => {
                    const borrower = loan.userId as unknown as {
                      fullName?: string;
                    };
                    return (
                      <tr
                        key={loan._id}
                        className="hover:bg-surface transition-colors duration-150"
                      >
                        <td className="py-3 px-4 sm:py-4 sm:px-6">
                          <div className="flex flex-col">
                            <span className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface font-medium truncate">
                              {borrower?.fullName || "Unknown Borrower"}
                            </span>
                            <span className="font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface-variant">
                              LN-{loan._id}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface text-right">
                          {formatINR(loan.principal)}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface text-right">
                          {formatINR(loan.totalRepayment)}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-primary text-right">
                          {formatINR(loan.amountPaid)}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface font-semibold text-right">
                          {formatINR(loan.outstandingBalance)}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-label-sm ${
                              loan.status === "disbursed"
                                ? "bg-primary-container text-on-primary-container"
                                : loan.status === "closed"
                                  ? "bg-surface-variant text-on-surface-variant border border-outline-variant"
                                  : "bg-secondary-container text-on-secondary-container"
                            }`}
                          >
                            {loan.status.charAt(0).toUpperCase() +
                              loan.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
