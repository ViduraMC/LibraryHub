import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {


        title: {
            type: String,
            required: [true, "Report title is required"],
            trim: true,
        },

        type: {
            type: String,
            enum: ["weekly", "monthly", "custom"],
            required: [true, "Report type is required"],
        },

        periodStart: {
            type: Date,
            required: [true, "Period start date is required"],
        },

        periodEnd: {
            type: Date,
            required: [true, "Period end date is required"],
        },

        totalBooks: {
            type: Number,
            required: true,
            min: 0,
        },


        lostBooks: {
            type: Number,
            required: true,
            min: 0,
        },

        totalNewUsers: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },

        isFinalized: {
            type: Boolean,
            default: false,
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: [true, "Admin ID is required"],
        },

        finalizedAt: {
            type: Date,
            default: null,
        },

        archivedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for filtering active reports
reportSchema.index({ status: 1, isFinalized: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
