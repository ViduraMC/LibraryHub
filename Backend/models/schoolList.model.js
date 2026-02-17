import mongoose from "mongoose";

const schoolListSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["student", "teacher"],
            required: [true, "List type is required"],
        },
        schoolId: {
            type: String,
            required: [true, "School ID is required"],
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },

        // Student-specific fields (from CSV)
        grade: {
            type: String,
            trim: true,
        },
        classRoom: {
            type: String,
            trim: true,
        },

        // Teacher-specific fields (from CSV)
        subject: {
            type: String,
            trim: true,
        },

        // Track which admin uploaded this data
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: ensures each school ID is unique per type, and makes lookup fast
schoolListSchema.index({ type: 1, schoolId: 1 }, { unique: true });

const SchoolList = mongoose.model("SchoolList", schoolListSchema);

export default SchoolList;
