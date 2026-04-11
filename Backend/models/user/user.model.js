import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        profileImageURL: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["admin", "librarian", "student", "teacher"],
            required: [true, "Role is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        noOfBorrowedBooks: {
            type: Number,
            default: 0,
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        discriminatorKey: "role",
    }
);

// Hash password before saving (only when password is modified)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
