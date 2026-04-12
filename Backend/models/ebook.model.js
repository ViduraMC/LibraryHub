import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        author: {
            type: String,
            required: [true, "Author is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            required: true,
            enum: ["Textbook", "Reference", "Novel", "Pastpaper", "Guide", "Other"],
            default: "Other",
        },
        grade: {
            type: String,
            trim: true,
            default: "",
        },
        tags: [{ type: String, trim: true }],
        coverImage: {
            type: String,
            trim: true,
            default: "",
        },
        filePath: {
            type: String,
            required: [true, "PDF file path is required"],
        },
        originalFileName: {
            type: String,
            trim: true,
            default: "",
        },
        fileSize: {
            type: Number,
            default: 0,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Text index for search
ebookSchema.index({ title: "text", author: "text", description: "text" });

const Ebook = mongoose.model("Ebook", ebookSchema);

export default Ebook;
