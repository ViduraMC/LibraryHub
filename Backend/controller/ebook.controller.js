import Ebook from "../models/ebook.model.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// ── POST /api/ebooks  (librarian) ─────────────────────────────────────────────
export const uploadEbook = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "PDF file is required" });
        }

        const { title, author, description, category, grade, tags, coverImage } = req.body;

        if (!title || !author) {
            // Clean up the uploaded file if validation fails
            if (req.file?.path) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "Title and author are required" });
        }

        const ebook = await Ebook.create({
            title: title.trim(),
            author: author.trim(),
            description: description?.trim() || "",
            category: category || "Other",
            grade: grade?.trim() || "",
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter(Boolean)) : [],
            coverImage: coverImage?.trim() || "",
            filePath: `/uploads/${req.file.filename}`,
            originalFileName: req.file.originalname,
            fileSize: req.file.size,
            uploadedBy: req.user._id,
        });

        const populated = await Ebook.findById(ebook._id).populate("uploadedBy", "fullName email");

        res.status(201).json({ success: true, message: "E-book uploaded successfully", data: populated });
    } catch (error) {
        // Clean up file on error
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("Upload ebook error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── GET /api/ebooks  (authenticated) ──────────────────────────────────────────
export const listEbooks = async (req, res) => {
    try {
        const {
            q,
            category,
            grade,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            order = "desc",
            showInactive,
        } = req.query;

        const filter = {};

        // Students/teachers only see active e-books; librarians can see all
        const isStaff = req.user?.role === "librarian" || req.user?.role === "admin";
        if (!isStaff || showInactive !== "true") {
            filter.isActive = true;
        }

        if (category) filter.category = category;
        if (grade) filter.grade = grade;
        if (q) {
            const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { title: { $regex: escaped, $options: "i" } },
                { author: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } },
            ];
        }

        const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
        const sort = { [sortBy]: order === "asc" ? 1 : -1 };

        const [data, total] = await Promise.all([
            Ebook.find(filter)
                .populate("uploadedBy", "fullName email")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Ebook.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            meta: { total, page: Number(page), limit: Number(limit) },
            data,
        });
    } catch (error) {
        console.error("List ebooks error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── GET /api/ebooks/:id  (authenticated) ──────────────────────────────────────
export const getEbookById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const ebook = await Ebook.findById(id).populate("uploadedBy", "fullName email");
        if (!ebook) {
            return res.status(404).json({ success: false, message: "E-book not found" });
        }

        // Increment view count
        ebook.viewCount += 1;
        await ebook.save();

        res.status(200).json({ success: true, data: ebook });
    } catch (error) {
        console.error("Get ebook error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── GET /api/ebooks/:id/download  (authenticated) ────────────────────────────
export const downloadEbook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const ebook = await Ebook.findById(id);
        if (!ebook) {
            return res.status(404).json({ success: false, message: "E-book not found" });
        }

        // Resolve the absolute path from the stored relative path (/uploads/filename.pdf)
        const fileName = path.basename(ebook.filePath);
        const absolutePath = path.join(uploadsDir, fileName);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: "PDF file not found on server" });
        }

        // Increment download count
        ebook.downloadCount += 1;
        await ebook.save();

        // Set the download filename to the original name or a clean title
        const downloadName = ebook.originalFileName || `${ebook.title.replace(/[^a-zA-Z0-9\s]/g, "")}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
        res.setHeader("Content-Type", "application/pdf");

        const stream = fs.createReadStream(absolutePath);
        stream.pipe(res);
    } catch (error) {
        console.error("Download ebook error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── PUT /api/ebooks/:id  (librarian) ──────────────────────────────────────────
export const updateEbook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const ebook = await Ebook.findById(id);
        if (!ebook) {
            return res.status(404).json({ success: false, message: "E-book not found" });
        }

        const allowedFields = ["title", "author", "description", "category", "grade", "tags", "coverImage", "isActive"];
        const updates = {};

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === "tags" && typeof req.body[key] === "string") {
                    updates[key] = req.body[key].split(",").map((t) => t.trim()).filter(Boolean);
                } else {
                    updates[key] = req.body[key];
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided for update" });
        }

        const updated = await Ebook.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
            .populate("uploadedBy", "fullName email");

        res.status(200).json({ success: true, message: "E-book updated successfully", data: updated });
    } catch (error) {
        console.error("Update ebook error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── DELETE /api/ebooks/:id  (librarian) ───────────────────────────────────────
export const deleteEbook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const ebook = await Ebook.findById(id);
        if (!ebook) {
            return res.status(404).json({ success: false, message: "E-book not found" });
        }

        // Delete the PDF file from disk
        const fileName = path.basename(ebook.filePath);
        const absolutePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        await Ebook.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "E-book deleted successfully" });
    } catch (error) {
        console.error("Delete ebook error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
