import { Router } from "express";
import { verifyToken } from "@/middleware/verifyToken";
import { authorizeRoles } from "@/middleware/authorizeRoles";
import {
  getAllLoans,
  getAllUsers,
  deleteUser,
} from "@/controllers/adminController";

export const adminRoutes = Router();

adminRoutes.use(verifyToken);
adminRoutes.use(authorizeRoles("admin"));

adminRoutes.get("/users", getAllUsers);
adminRoutes.get("/loans", getAllLoans);
adminRoutes.delete("/users/:userId", deleteUser);

// Test endpoint to verify admin routes are working
adminRoutes.get("/test", (req, res) => {
  res.json({ success: true, data: { message: "Admin routes are working" } });
});
