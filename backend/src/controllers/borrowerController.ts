import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Application } from "@/models/Application";
import { Loan } from "@/models/Loan";
import { runBRE } from "@/services/breService";
import { calculateLoan } from "@/services/loanCalculator";

const requiredUser = (req: Request): { userId: string } | null => {
  const id = req.user?._id;
  if (!id) {
    return null;
  }
  return { userId: id };
};

const asNumber = (value: unknown): number | null => {
  const n = typeof value === "number" ? value : Number(String(value ?? ""));
  if (!Number.isFinite(n)) {
    return null;
  }
  return n;
};

export const savePersonalDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const auth = requiredUser(req);
    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    console.log("Saving personal details for user:", auth.userId);

    const fullName = String(req.body?.fullName ?? "").trim();
    const pan = String(req.body?.pan ?? "")
      .trim()
      .toUpperCase();
    const dateOfBirth = String(req.body?.dateOfBirth ?? "").trim();
    const monthlySalary = asNumber(req.body?.monthlySalary);
    const employmentMode = String(req.body?.employmentMode ?? "").trim();

    if (
      fullName.length === 0 ||
      pan.length === 0 ||
      dateOfBirth.length === 0 ||
      monthlySalary === null ||
      employmentMode.length === 0
    ) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const bre = runBRE({ dateOfBirth, monthlySalary, pan, employmentMode });
    if (!bre.passed) {
      res.status(422).json({ success: false, breErrors: bre.errors });
      return;
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      res.status(400).json({ success: false, message: "Invalid dateOfBirth" });
      return;
    }

    const updated = await Application.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(auth.userId) },
      {
        $set: {
          fullName,
          pan,
          dateOfBirth: dob,
          monthlySalary,
          employmentMode,
        },
        $setOnInsert: {
          salarySlipUrl: "",
          salarySlipOriginalName: "",
          status: "incomplete",
        },
      },
      { upsert: true, new: true },
    );

    res.status(200).json({ success: true, data: updated.toJSON() });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const uploadSalarySlip = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const auth = requiredUser(req);
    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const app = await Application.findOne({ userId: auth.userId });
    if (!app) {
      res
        .status(404)
        .json({ success: false, message: "Application not found" });
      return;
    }

    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json({ success: false, message: "salarySlip file is required" });
      return;
    }

    // Persist upload in MongoDB (Vercel serverless filesystem is not reliable for uploads).
    app.salarySlipData = file.buffer;
    app.salarySlipMime = file.mimetype;
    app.salarySlipUrl = `/api/borrower/salary-slip`;
    app.salarySlipOriginalName = file.originalname;

    const saved = await app.save();
    res.status(200).json({ success: true, data: saved.toJSON() });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSalarySlip = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = requiredUser(req);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // We must explicitly select salarySlipData because it is excluded by default.
    const app = await Application.findOne({ userId: auth.userId }).select(
      '+salarySlipData +salarySlipMime salarySlipOriginalName',
    );
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (!app.salarySlipData || app.salarySlipData.length === 0) {
      res.status(404).json({ success: false, message: 'Salary slip not uploaded' });
      return;
    }

    const mime = app.salarySlipMime || 'application/octet-stream';
    const name = app.salarySlipOriginalName || 'salary-slip';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${String(name).replace(/\"/g, '')}"`);
    res.status(200).send(app.salarySlipData);
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const applyLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = requiredUser(req);
    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const principal = asNumber(req.body?.principal);
    const tenureDays = asNumber(req.body?.tenureDays);

    if (principal === null || tenureDays === null) {
      res.status(400).json({
        success: false,
        message: "principal and tenureDays are required",
      });
      return;
    }

    if (principal < 50000 || principal > 500000) {
      res.status(400).json({
        success: false,
        message: "principal must be between 50000 and 500000",
      });
      return;
    }

    if (tenureDays < 30 || tenureDays > 365) {
      res.status(400).json({
        success: false,
        message: "tenureDays must be between 30 and 365",
      });
      return;
    }

    const app = await Application.findOne({ userId: auth.userId });
    if (!app) {
      res
        .status(404)
        .json({ success: false, message: "Application not found" });
      return;
    }

    if (!app.salarySlipUrl || app.salarySlipUrl.trim().length === 0) {
      res
        .status(400)
        .json({ success: false, message: "Salary slip is required" });
      return;
    }

    const existingLoan = await Loan.findOne({ applicationId: app._id });
    if (existingLoan) {
      res.status(409).json({
        success: false,
        message: "Loan already exists for this application",
      });
      return;
    }

    const calc = calculateLoan(principal, Math.round(tenureDays));

    const loan = await Loan.create({
      applicationId: app._id,
      userId: new mongoose.Types.ObjectId(auth.userId),
      principal: calc.principal,
      tenureDays: calc.tenureDays,
      interestRate: calc.interestRate,
      simpleInterest: calc.simpleInterest,
      totalRepayment: calc.totalRepayment,
      amountPaid: 0,
      outstandingBalance: calc.outstandingBalance,
      status: "sanctioned",
    });

    app.status = "applied";
    await app.save();

    res.status(201).json({
      success: true,
      data: { application: app.toJSON(), loan: loan.toJSON() },
    });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const auth = requiredUser(req);
    if (!auth) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    console.log("Getting application for user:", auth.userId);

    const app = await Application.findOne({ userId: auth.userId });
    console.log("Found application:", app ? app._id : "null");

    if (!app) {
      res
        .status(200)
        .json({ success: true, data: { application: null, loan: null } });
      return;
    }

    const loan = await Loan.findOne({ applicationId: app._id });
    console.log("Found loan:", loan ? loan._id : "null");

    res.status(200).json({
      success: true,
      data: { application: app.toJSON(), loan: loan ? loan.toJSON() : null },
    });
  } catch (error) {
    console.error("Error in getMyApplication:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
