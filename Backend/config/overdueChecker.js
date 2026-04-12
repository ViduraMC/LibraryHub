import cron from "node-cron";
import mongoose from "mongoose";
import BookTransaction from "../models/bookTransaction.model.js";

// runs every day at midnight: "0 0 * * *"
// for dev/testing: every minute: "* * * * *"
const startOverdueChecker = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = new Date();

            // find all active transactions where dueDate has passed
            const result = await BookTransaction.updateMany(
                { status: "active", dueDate: { $lt: now }, isDeleted: false },
                { $set: { status: "overdue" } }
            );

            if (result.modifiedCount > 0) {
                console.log(
                    `[Cron] Overdue check: ${result.modifiedCount} transaction(s) marked as overdue`
                );
            }
        } catch (error) {
            console.error("[Cron] Overdue checker error:", error.message);
        }
    });

    console.log("[Cron] Overdue checker scheduled — runs daily at midnight");
};

export default startOverdueChecker;
