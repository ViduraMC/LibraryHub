import mongoose from "mongoose";
import User from "./user.model.js";

const teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        required: [true, "Teacher ID is required"],
        trim: true,
    },
    membershipId: {
        type: String,
        unique: true,
        sparse: true, // allows multiple null values (set only after approval)
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true,
    },
});

const Teacher = User.discriminator("teacher", teacherSchema);

export default Teacher;
