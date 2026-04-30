"use client";

import React, { Component, ErrorInfo, ReactNode, useEffect } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with services like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 sm:p-8 max-w-md w-full shadow-sm">
            <div className="text-center">
              <span
                className="material-symbols-outlined text-error text-4xl mb-4 block"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                error
              </span>
              <h1 className="font-h3 text-h3 text-on-surface mb-2">
                Something went wrong
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left mb-4 p-3 bg-error-container rounded-lg">
                  <summary className="font-label-sm text-label-sm text-on-error-container cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-on-error-container overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-surface-container text-on-surface border border-outline-variant px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function GlobalErrorHandler(): null {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Log to external service in production
      if (process.env.NODE_ENV === "production") {
        // Example: logToExternalService('unhandledRejection', event.reason);
      }

      // Prevent the error from being logged to console as an unhandled rejection
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global JavaScript error:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Log to external service in production
      if (process.env.NODE_ENV === "production") {
        // Example: logToExternalService('globalError', event.error);
      }
    };

    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      console.error("Resource loading error:", {
        tagName: target?.tagName,
        src: (target as any)?.src || (target as any)?.href,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    window.addEventListener("error", handleResourceError, true); // Capture phase for resource errors

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
      window.removeEventListener("error", handleResourceError, true);
    };
  }, []);

  return null;
}
