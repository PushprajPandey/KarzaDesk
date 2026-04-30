import { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";

const app = express();

// CORS configuration for production
const allowedOrigins = [
  "https://karza-desk.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

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
        origin?.includes("localhost")
      ) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running on Vercel",
    cors: allowedOrigins,
    timestamp: new Date().toISOString(),
  });
});

// Test login endpoint
app.post("/api/auth/login", (req, res) => {
  res.json({
    message: "Login endpoint working",
    body: req.body,
    origin: req.headers.origin,
  });
});

// Catch all for debugging
app.all("*", (req, res) => {
  res.json({
    message: "Route not found",
    method: req.method,
    url: req.url,
    headers: req.headers,
  });
});

// Vercel serverless function handler
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
