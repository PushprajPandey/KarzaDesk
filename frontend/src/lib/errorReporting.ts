interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

class ErrorReportingService {
  private isProduction = process.env.NODE_ENV === "production";
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;

  async reportError(
    error: Error | string,
    additionalData?: Record<string, any>,
  ) {
    const errorReport: ErrorReport = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "object" ? error.stack : undefined,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: new Date().toISOString(),
      additionalData,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error("Error Report:", errorReport);
      return;
    }

    // In production, you can send to external services
    try {
      // Example: Send to your own API endpoint
      if (this.apiUrl) {
        await fetch(`${this.apiUrl}/api/errors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(errorReport),
        });
      }

      // Example: Send to external services like Sentry
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     extra: additionalData,
      //   });
      // }

      // Example: Send to LogRocket
      // if (window.LogRocket) {
      //   window.LogRocket.captureException(error);
      // }
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  }

  reportApiError(error: any, endpoint: string, method: string) {
    this.reportError(error, {
      type: "API_ERROR",
      endpoint,
      method,
      status: error?.status,
      response: error?.data,
    });
  }

  reportUserAction(action: string, data?: Record<string, any>) {
    if (!this.isProduction) {
      console.log("User Action:", action, data);
      return;
    }

    // Log user actions for analytics
    try {
      // Example: Send to analytics service
      // analytics.track(action, data);
    } catch (error) {
      console.error("Failed to report user action:", error);
    }
  }
}

export const errorReporting = new ErrorReportingService();
