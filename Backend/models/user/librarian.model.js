import mongoose from "mongoose";
import User from "./user.model.js";

const librarianSchema = new mongoose.Schema({
    librarianId: {
        type: String,
        unique: true,
    },
});

// Auto-generate librarianId before saving (LIB-001, LIB-002...)
// Uses the highest existing ID + 1 (NOT countDocuments, which breaks after deletions)
librarianSchema.pre("save", async function () {
    if (this.librarianId) return;

    // Find the librarian with the highest ID number
    const lastLib = await Librarian.findOne({})
        .sort({ createdAt: -1 })
        .select("librarianId");

    let nextNum = 1;
    if (lastLib?.librarianId) {
        // Extract the number from "LIB-003" → 3, then add 1
        const match = lastLib.librarianId.match(/LIB-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
    }

    this.librarianId = `LIB-${String(nextNum).padStart(3, "0")}`;
});

const Librarian = User.discriminator("librarian", librarianSchema);

export default Librarian;

