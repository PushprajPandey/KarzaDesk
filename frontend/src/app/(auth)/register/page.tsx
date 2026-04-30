"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage(): JSX.Element {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = fullName.trim();
    const em = email.trim().toLowerCase();

    if (
      name.length === 0 ||
      em.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await register({ fullName: name, email: em, password });
    } catch (err: any) {
      console.error("Registration error:", err);

      // Extract the actual error message
      let errorMessage =
        "Registration failed. Please check if the backend server is running.";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-on-surface selection:bg-primary-container selection:text-on-primary-container px-4 py-6 sm:px-6 sm:py-8">
      {/* Animated Background */}
      <div
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgb(188, 201, 198) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(0, 104, 95, 0.15) 0%, transparent 60%)",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-4 sm:mb-6 text-center">
          <Logo size={48} className="mb-3 sm:mb-4 shadow-sm" />
          <h1 className="font-h4 text-h4 sm:font-h3 sm:text-h3 text-on-surface mb-1">
            KarzaDesk
          </h1>
          <p className="font-body-sm text-body-sm sm:font-body-md sm:text-body-md text-outline">
            Secure access for borrowers and staff
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant w-full">
          <h2 className="font-h4 text-h4 sm:font-h3 sm:text-h3 mb-3 sm:mb-4 text-on-surface">
            Create account
          </h2>

          {/* Error Display */}
          {error && (
            <div className="bg-error-container text-on-error-container border-l-4 border-error p-3 sm:p-4 rounded-r mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3">
              <span
                className="material-symbols-outlined mt-0.5 text-sm sm:text-base"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                error
              </span>
              <p className="font-body-sm text-body-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
            {/* Full Name Field */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline"
                id="email"
                name="email"
                placeholder="name@company.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline pr-10 sm:pr-12"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline pr-10 sm:pr-12"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-1 sm:mt-2 bg-gradient-to-br from-primary to-secondary text-on-primary font-label-sm sm:font-label-md text-label-sm sm:text-label-md py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin text-on-primary text-sm sm:text-base"
                    style={{ fontSize: "18px" }}
                  >
                    progress_activity
                  </span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link
                className="font-label-sm text-label-sm text-primary hover:underline transition-colors"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
