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

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
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

const start = async (): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo(env.MONGO_URI);
    console.log("MongoDB connected successfully");

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
