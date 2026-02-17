import mongoose from "mongoose";
import User from "./user.model.js";

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        unique: true,
    },
});

// Auto-generate adminId before saving (ADM-001, ADM-002...)
adminSchema.pre("save", async function () {
    if (this.adminId) return;

    const count = await Admin.countDocuments();
    this.adminId = `ADM-${String(count + 1).padStart(3, "0")}`;
});

const Admin = User.discriminator("admin", adminSchema);

export default Admin;
