import type { NextFunction, Request, Response } from "express";
import { isApiError } from "@/utils/errors";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Log the error for debugging
  console.error("Global Error Handler:", {
    error: err,
    message: err instanceof Error ? err.message : "Unknown error",
    stack: err instanceof Error ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  if (res.headersSent) {
    next(err);
    return;
  }

  if (isApiError(err)) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // CORS errors (thrown by the cors middleware)
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({
      success: false,
      message: "CORS: origin not allowed",
    });
    return;
  }

  // Handle specific error types
  if (err instanceof Error) {
    // MongoDB/Mongoose errors
    if (err.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        details: err.message,
      });
      return;
    }

    if (err.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
      return;
    }

    if (err.name === "MongoServerError" && (err as any).code === 11000) {
      res.status(409).json({
        success: false,
        message: "Duplicate entry",
      });
      return;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }
  }

  // Default error response
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err instanceof Error
          ? err.message
          : "Internal server error"
        : "Internal server error",
    ...(process.env.NODE_ENV === "development" &&
      err instanceof Error && { stack: err.stack }),
  });
};
