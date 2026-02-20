import mongoose from "mongoose";

const bookTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: [true, "Book ID is required"],
        },
        borrowDate: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
        returnDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["active", "returned", "overdue", "lost"],
            default: "active",
        },
        renewed: {
            type: Boolean,
            default: false,
        },
        renewedAt: {
            type: Date,
        },
        isLate: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// compound indexes for fast queries
bookTransactionSchema.index({ userId: 1, status: 1 });
bookTransactionSchema.index({ status: 1, dueDate: 1 });

const BookTransaction = mongoose.model(
    "BookTransaction",
    bookTransactionSchema
);

export default BookTransaction;
