import { connectMongo } from "@/config/db";
import { env } from "@/config/env";
import { User } from "@/models/User";

type SeedUser = {
  fullName: string;
  email: string;
  password: string;
  role:
    | "admin"
    | "sales"
    | "sanction"
    | "disbursement"
    | "collection"
    | "borrower";
};

const users: SeedUser[] = [
  {
    email: "admin@lms.com",
    password: "Admin@123",
    role: "admin",
    fullName: "Admin User",
  },
  {
    email: "sales@lms.com",
    password: "Sales@123",
    role: "sales",
    fullName: "Sales Executive",
  },
  {
    email: "sanction@lms.com",
    password: "Sanction@123",
    role: "sanction",
    fullName: "Sanction Executive",
  },
  {
    email: "disburse@lms.com",
    password: "Disburse@123",
    role: "disbursement",
    fullName: "Disbursement Executive",
  },
  {
    email: "collection@lms.com",
    password: "Collect@123",
    role: "collection",
    fullName: "Collection Executive",
  },
  {
    email: "borrower@lms.com",
    password: "Borrower@123",
    role: "borrower",
    fullName: "Test Borrower",
  },
];

const seed = async (): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo(env.MONGO_URI);
    console.log("Connected successfully");

    const emails = users.map((u) => u.email);
    console.log("Deleting existing users...");
    await User.deleteMany({ email: { $in: emails } });

    console.log("Creating new users...");
    for (const u of users) {
      console.log(`Creating user: ${u.email} (${u.role})`);
      await User.create(u);
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed().catch(() => {
  process.exitCode = 1;
});
