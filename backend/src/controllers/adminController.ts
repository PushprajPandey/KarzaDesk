import type { Request, Response } from "express";
import { User } from "@/models/User";
import { Loan } from "@/models/Loan";
import { Application } from "@/models/Application";
import { Payment } from "@/models/Payment";

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({ success: true, data: users.map((u) => u.toJSON()) });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllLoans = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const loans = await Loan.find()
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "-password" })
      .populate({
        path: "applicationId",
        populate: { path: "userId", select: "fullName email role" },
      })
      .exec();

    res.status(200).json({ success: true, data: loans.map((l) => l.toJSON()) });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`Delete user request for ID: ${userId}`);

    if (!userId) {
      console.log("No userId provided");
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    // Find the user first
    const user = await User.findById(userId).exec();
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    console.log(`Deleting user: ${user.fullName} (${user.email})`);

    // Delete all related data in the correct order
    // 1. Delete payments related to user's loans
    const userLoans = await Loan.find({ userId }).exec();
    const loanIds = userLoans.map((loan) => loan._id);
    console.log(`Found ${userLoans.length} loans for user`);

    if (loanIds.length > 0) {
      const deletedPayments = await Payment.deleteMany({
        loanId: { $in: loanIds },
      }).exec();
      console.log(`Deleted ${deletedPayments.deletedCount} payments`);
    }

    // 2. Delete loans
    const deletedLoans = await Loan.deleteMany({ userId }).exec();
    console.log(`Deleted ${deletedLoans.deletedCount} loans`);

    // 3. Delete applications
    const deletedApplications = await Application.deleteMany({ userId }).exec();
    console.log(`Deleted ${deletedApplications.deletedCount} applications`);

    // 4. Finally delete the user
    await User.findByIdAndDelete(userId).exec();
    console.log(`Successfully deleted user: ${user.fullName}`);

    res.status(200).json({
      success: true,
      data: {
        message: `User ${user.fullName} and all related data deleted successfully`,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
