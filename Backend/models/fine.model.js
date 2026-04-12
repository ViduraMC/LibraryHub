import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
    {
        bookTransactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookTransaction",
            required: [true, "Book Transaction ID is required"],
            unique: true,
        },


        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],

        },

        daysOverdue: {
            type: Number,
            required: [true, "Days overdue is required"],
            default: 0,

        },


        fineAmount: {
            type: Number,
            required: [true, "Fine amount is required"],
            min: [0, "Fine amount cannot be negative"],

        },


        fineStatus: {
            type: String,
            enum: ["unpaid", "paid", "cancelled", "refunded"],
            default: "unpaid",
        },

        paymentDate: {
            type: Date,
            default: null,
        },

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        cancellationReason: {
            type: String,
            default: null,
        },

        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        cancellationDate: {
            type: Date,
            default: null,
        },

        refundAmount: {
            type: Number,
            default: null,
        },

        refundReason: {
            type: String,
            default: null,
        },

        refundedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        refundDate: {
            type: Date,
            default: null,
        },

        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: [true, "Book ID is required"],
            default: null,

        },

    },
    {
        timestamps: true,
    }

);

const Fine = mongoose.model("Fine", fineSchema);

export default Fine;
