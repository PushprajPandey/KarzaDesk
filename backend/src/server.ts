import express from "express";
import cors from "cors";
import path from "path";
import { env } from "@/config/env";
import { connectMongo } from "@/config/db";
import { errorHandler } from "@/middleware/errorHandler";
import { requestLogger } from "@/middleware/requestLogger";
import { authRoutes } from "@/routes/authRoutes";
import { borrowerRoutes } from "@/routes/borrowerRoutes";
import { salesRoutes } from "@/routes/salesRoutes";
import { sanctionRoutes } from "@/routes/sanctionRoutes";
import { disbursementRoutes } from "@/routes/disbursementRoutes";
import { collectionRoutes } from "@/routes/collectionRoutes";
import { adminRoutes } from "@/routes/adminRoutes";

const app = express();

// CORS configuration for multiple environments
const allowedOrigins = [
  env.FRONTEND_URL,
  "https://karza-desk.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow any localhost origin
      if (
        process.env.NODE_ENV !== "production" &&
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/borrower", borrowerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/sanction", sanctionRoutes);
app.use("/api/disbursement", disbursementRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

// MongoDB connection for Vercel
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await connectMongo(env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

// For local development
const start = async (): Promise<void> => {
  try {
    await connectDB();

    await new Promise<void>((resolve) => {
      app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT}`);
        resolve();
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    throw error;
  }
};

// Export app for Vercel
export default async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  // Global error handlers
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    process.exit(0);
  });

  start().catch((error) => {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
  });
}
