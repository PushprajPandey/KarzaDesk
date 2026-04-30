const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
const allowedOrigins = [
  "https://karza-desk.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // In development, allow any localhost origin
      if (
        process.env.NODE_ENV !== "production" &&
        origin &&
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running on Vercel",
    cors: allowedOrigins,
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
  });
});

// Test login endpoint
app.post("/api/auth/login", (req, res) => {
  res.json({
    message: "Login endpoint working",
    body: req.body,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Catch all
app.all("*", (req, res) => {
  res.json({
    message: "Route handler working",
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
  });
});

module.exports = app;
