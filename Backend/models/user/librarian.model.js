import mongoose from "mongoose";
import User from "./user.model.js";

const librarianSchema = new mongoose.Schema({
    librarianId: {
        type: String,
        unique: true,
    },
});

// Auto-generate librarianId before saving (LIB-001, LIB-002...)
librarianSchema.pre("save", async function () {
    if (this.librarianId) return;

    const count = await Librarian.countDocuments();
    this.librarianId = `LIB-${String(count + 1).padStart(3, "0")}`;
});

const Librarian = User.discriminator("librarian", librarianSchema);

export default Librarian;
