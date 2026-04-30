import { connectMongo } from "@/config/db";
import { User } from "@/models/User";
import { Application } from "@/models/Application";
import { Loan } from "@/models/Loan";
import { Payment } from "@/models/Payment";

async function deleteUsersByName(names: string[]) {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }

    await connectMongo(mongoUri);

    console.log("🔍 Searching for users to delete...");

    for (const name of names) {
      console.log(`\n📋 Looking for user: ${name}`);

      // Find users with similar names (case insensitive)
      const users = await User.find({
        fullName: { $regex: name, $options: "i" },
      }).exec();

      if (users.length === 0) {
        console.log(`❌ No users found with name containing: ${name}`);
        continue;
      }

      for (const user of users) {
        console.log(`\n🗑️  Deleting user: ${user.fullName} (${user.email})`);

        // Delete all related data in the correct order
        // 1. Delete payments related to user's loans
        const userLoans = await Loan.find({ userId: user._id }).exec();
        const loanIds = userLoans.map((loan) => loan._id);

        if (loanIds.length > 0) {
          const deletedPayments = await Payment.deleteMany({
            loanId: { $in: loanIds },
          }).exec();
          console.log(`   💳 Deleted ${deletedPayments.deletedCount} payments`);
        }

        // 2. Delete loans
        const deletedLoans = await Loan.deleteMany({ userId: user._id }).exec();
        console.log(`   💰 Deleted ${deletedLoans.deletedCount} loans`);

        // 3. Delete applications
        const deletedApplications = await Application.deleteMany({
          userId: user._id,
        }).exec();
        console.log(
          `   📄 Deleted ${deletedApplications.deletedCount} applications`,
        );

        // 4. Finally delete the user
        await User.findByIdAndDelete(user._id).exec();
        console.log(`   👤 Deleted user: ${user.fullName}`);

        console.log(`✅ Successfully deleted all data for: ${user.fullName}`);
      }
    }

    console.log("\n🎉 Cleanup completed!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup for the specified users
const usersToDelete = ["Pushpraj Pandey", "Sajal Pandey"];
deleteUsersByName(usersToDelete);
