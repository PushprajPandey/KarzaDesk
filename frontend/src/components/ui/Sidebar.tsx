"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";

interface SidebarProps {
  children: React.ReactNode;
}

const getInitials = (fullName: string): string => {
  const names = fullName.trim().split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-primary-container text-on-primary-container",
    "bg-secondary-container text-on-secondary-container",
    "bg-tertiary-container text-on-tertiary-container",
    "bg-primary-fixed text-on-primary-fixed",
    "bg-secondary-fixed text-on-secondary-fixed",
    "bg-tertiary-fixed text-on-tertiary-fixed",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function Sidebar({ children }: SidebarProps): JSX.Element {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return <>{children}</>;

  const initials = getInitials(user.fullName);
  const avatarColor = getAvatarColor(user.fullName);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <nav
        className={`bg-surface-container-lowest text-primary font-label-md antialiased fixed left-0 top-0 h-full w-60 border-r z-50 border-outline-variant flex flex-col p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <Logo size={40} className="shadow-sm" />
          <div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              KarzaDesk
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
              Financial Integrity
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-2">
          {user.role === "borrower" && (
            <>
              <NavItem
                href="/personal-details"
                icon="person"
                label="Personal Details"
              />
              <NavItem
                href="/upload-slip"
                icon="upload_file"
                label="Upload Documents"
              />
              <NavItem
                href="/loan-config"
                icon="account_balance"
                label="Loan Configuration"
              />
              <NavItem
                href="/status"
                icon="dashboard"
                label="Application Status"
              />
            </>
          )}

          {user.role === "admin" && (
            <>
              <NavItem
                href="/admin"
                icon="dashboard"
                label="Dashboard"
                isActive
              />
              <NavItem href="/sales" icon="person_search" label="Borrowers" />
              <NavItem
                href="/sanction"
                icon="account_balance"
                label="Loan Accounts"
              />
              <NavItem
                href="/disbursement"
                icon="payments"
                label="Disbursements"
              />
              <NavItem
                href="/collection"
                icon="receipt_long"
                label="Payment History"
              />
            </>
          )}

          {user.role === "sales" && (
            <NavItem
              href="/sales"
              icon="person_search"
              label="Sales Dashboard"
            />
          )}

          {user.role === "sanction" && (
            <NavItem
              href="/sanction"
              icon="account_balance"
              label="Sanction Dashboard"
            />
          )}

          {user.role === "disbursement" && (
            <NavItem
              href="/disbursement"
              icon="payments"
              label="Disbursement Dashboard"
            />
          )}

          {user.role === "collection" && (
            <NavItem
              href="/collection"
              icon="receipt_long"
              label="Collection Dashboard"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-all duration-200 focus:ring-2 focus:ring-error outline-none w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-0">
        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant p-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-container transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-on-surface text-xl">
                menu
              </span>
            </button>
            <div className="flex items-center gap-2">
              <Logo size={24} className="shadow-sm" />
              <span className="font-label-md text-label-md text-on-surface">
                KarzaDesk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center font-label-sm text-xs border border-outline-variant`}
              >
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps): JSX.Element {
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const active = isActive || currentPath === href;

  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary outline-none ${
        active
          ? "bg-gradient-to-r from-primary-fixed to-secondary-fixed text-primary border-r-4 border-primary font-bold"
          : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
      }`}
    >
      <span
        className={`material-symbols-outlined ${active ? "fill" : ""}`}
        style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
}
