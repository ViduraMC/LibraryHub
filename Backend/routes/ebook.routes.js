import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import upload from "../middleware/upload.js";
import {
    uploadEbook,
    listEbooks,
    getEbookById,
    downloadEbook,
    updateEbook,
    deleteEbook,
} from "../controller/ebook.controller.js";

const router = express.Router();

// Authenticated routes (all logged-in users)
router.get("/", auth, listEbooks);
router.get("/:id", auth, getEbookById);
router.get("/:id/download", auth, downloadEbook);

// Librarian-only routes
router.post("/", auth, roleAuth("librarian", "admin"), upload.single("pdf"), uploadEbook);
router.put("/:id", auth, roleAuth("librarian", "admin"), updateEbook);
router.delete("/:id", auth, roleAuth("librarian", "admin"), deleteEbook);

export default router;
