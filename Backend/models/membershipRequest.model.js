import mongoose from "mongoose";

const membershipRequestSchema = new mongoose.Schema(
    {
        applicantType: {
            type: String,
            enum: ["student", "teacher"],
            required: [true, "Applicant type is required"],
        },

        // School-issued ID (from the registration form)
        studentId: {
            type: String,
            trim: true,
        },
        teacherId: {
            type: String,
            trim: true,
        },

        // Personal details
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        profileImageURL: {
            type: String,
        },

        // Student-specific fields
        grade: {
            type: String,
            trim: true,
        },
        classRoom: {
            type: String,
            trim: true,
        },
        guardianName: {
            type: String,
            trim: true,
        },
        guardianPhone: {
            type: String,
            trim: true,
        },

        // Teacher-specific fields
        subject: {
            type: String,
            trim: true,
        },

        // Request status tracking
        status: {
            type: String,
            enum: ["pending", "verified", "rejected", "approved", "active"],
            default: "pending",
        },
        rejectionReason: {
            type: String,
            trim: true,
        },

        // Timestamps for each status transition
        verifiedAt: {
            type: Date,
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Generated after approval
        membershipId: {
            type: String,
        },

        // Token for the "set your password" link
        passwordSetToken: {
            type: String,
        },
        passwordSetTokenExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookup by status (librarian dashboard queries)
membershipRequestSchema.index({ status: 1 });

const MembershipRequest = mongoose.model(
    "MembershipRequest",
    membershipRequestSchema
);

export default MembershipRequest;
