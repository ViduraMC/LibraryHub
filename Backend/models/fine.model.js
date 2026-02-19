import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
    {
        borrowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BorrowRecord",
            required: [true, "Borrow ID is required"],
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Member ID is required"],
        },
        daysOverdue: {
            type: Number,
            default: 0,
        },
        fineAmount: {
            type: Number,
            required: [true, "Fine amount is required"],
            min: [0, "Fine amount cannot be negative"],
        },
        fineStatus: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid",
        },
        paymentDate: {
            type: Date,
            default: null,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "online", "bank_transfer"],
            default: null,
        },
        transactionId: {
            type: String,
            sparse: true, // optional, only for online payments
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // usually the librarian who marks payment
            default: null,
        },
    },
    { timestamps: true }
);

// Compound index for finding unpaid fines for a member
fineSchema.index({ memberId: 1, fineStatus: 1 });

// Auto-populate references on queries
fineSchema.pre("find", function () {
    this.populate("borrowId memberId");
});

const Fine = mongoose.model("Fine", fineSchema);

export default Fine;