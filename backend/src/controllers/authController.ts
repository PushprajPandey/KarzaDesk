import type { Request, Response } from "express";
import { User } from "@/models/User";
import { signJwt } from "@/utils/jwt";

const isEmail = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Registration request received:", req.body);

    const fullName = String(req.body?.fullName ?? "").trim();
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? "");

    console.log("Parsed data:", {
      fullName,
      email,
      passwordLength: password.length,
    });

    if (fullName.length === 0 || email.length === 0 || password.length === 0) {
      console.log("Validation failed: missing fields");
      res
        .status(400)
        .json({
          success: false,
          message: "fullName, email, password are required",
        });
      return;
    }

    if (!isEmail(email)) {
      console.log("Validation failed: invalid email");
      res.status(400).json({ success: false, message: "Invalid email" });
      return;
    }

    if (password.length < 8) {
      console.log("Validation failed: password too short");
      res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      return;
    }

    console.log("Checking if user exists...");
    const exists = await User.exists({ email });
    if (exists) {
      console.log("User already exists");
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    console.log("Creating user...");
    const user = await User.create({
      fullName,
      email,
      password,
      role: "borrower",
    });
    const token = signJwt({ userId: String(user._id), role: user.role });

    const safe = await User.findById(user._id).select("-password");
    if (!safe) {
      console.log("Failed to retrieve created user");
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return;
    }

    console.log("User created successfully:", safe._id);
    res
      .status(201)
      .json({ success: true, data: { user: safe.toJSON(), token } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? "");

    if (email.length === 0 || password.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = signJwt({ userId: String(user._id), role: user.role });
    const safe = await User.findById(user._id).select("-password");
    if (!safe) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return;
    }

    res
      .status(200)
      .json({ success: true, data: { user: safe.toJSON(), token } });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
