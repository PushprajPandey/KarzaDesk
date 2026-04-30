"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage(): JSX.Element {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const em = email.trim().toLowerCase();
    if (em.length === 0 || password.length === 0) {
      setError("Email and password are required");
      return;
    }

    try {
      await login(em, password);
    } catch {
      setError(
        "Invalid email or password. Please check your credentials and try again.",
      );
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-on-surface selection:bg-primary-container selection:text-on-primary-container px-4 sm:px-6">
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

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Logo size={56} className="mb-4 shadow-sm" />
          <h1 className="font-h3 text-h3 sm:text-h2 sm:font-h2 text-on-surface mb-1">
            KarzaDesk
          </h1>
          <p className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-outline">
            Secure access for borrowers and staff
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant w-full">
          <h2 className="font-h3 text-h3 mb-4 text-on-surface">Sign in</h2>

          {/* Error Display */}
          {error && (
            <div className="bg-error-container text-on-error-container border-l-4 border-error p-3 sm:p-4 rounded-r mb-4 flex items-start gap-3">
              <span
                className="material-symbols-outlined mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                error
              </span>
              <p className="font-body-sm text-body-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className="w-full px-3 sm:px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline"
                id="email"
                name="email"
                placeholder="name@company.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  className="w-full px-3 sm:px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm sm:font-body-md text-body-sm sm:text-body-md transition-colors placeholder:text-outline pr-12"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest group-hover:border-primary transition-colors"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Remember me
                </span>
              </label>
              <a
                className="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant hover:underline transition-colors"
                href="#"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-2 bg-gradient-to-br from-primary to-secondary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin text-on-primary"
                    style={{ fontSize: "20px" }}
                  >
                    progress_activity
                  </span>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link
                className="font-label-sm text-label-sm text-primary hover:underline transition-colors"
                href="/register"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
