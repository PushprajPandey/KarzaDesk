const express = require("express");

const app = express();

// Manual CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://karza-desk.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running on Vercel",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method,
  });
});

// Test login endpoint
app.post("/api/auth/login", (req, res) => {
  console.log("Login request received:", {
    origin: req.headers.origin,
    method: req.method,
    body: req.body,
  });

  res.json({
    success: true,
    message: "Login endpoint working",
    body: req.body,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "KarzaDesk Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Catch all for debugging
app.all("*", (req, res) => {
  console.log("Request received:", {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
  });

  res.json({
    message: "Route handler working",
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
