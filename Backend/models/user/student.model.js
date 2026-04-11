import mongoose from "mongoose";
import User from "./user.model.js";

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, "Student ID is required"],
        trim: true,
    },
    membershipId: {
        type: String,
        unique: true,
        sparse: true, // allows multiple null values (set only after approval)
    },
    grade: {
        type: String,
        required: [true, "Grade is required"],
        trim: true,
    },
    classRoom: {
        type: String,
        required: [true, "Classroom is required"],
        trim: true,
    },
    guardianName: {
        type: String,
        required: [true, "Guardian name is required"],
        trim: true,
    },
    guardianPhone: {
        type: String,
        required: [true, "Guardian phone number is required"],
        trim: true,
    },
});

const Student = User.discriminator("student", studentSchema);

export default Student;
