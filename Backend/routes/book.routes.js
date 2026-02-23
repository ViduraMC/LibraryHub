import express from "express";
import * as bookCtrl from "../controller/book.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public (authenticated) routes
router.get("/", auth, bookCtrl.listBooks);
router.get("/:id", auth, bookCtrl.getBookById);

// Librarian-only routes
router.post("/", auth, roleAuth("librarian", "admin"), bookCtrl.createBook);
router.put("/:id", auth, roleAuth("librarian", "admin"), bookCtrl.updateBook);
router.delete("/:id", auth, roleAuth("librarian", "admin"), bookCtrl.deleteBook);

// Upload PDF for pastpapers / e-books
router.post(
    "/:id/upload-pdf",
    auth,
    roleAuth("librarian", "admin"),
    upload.single("pdf"),
    bookCtrl.uploadPdf
);

export default router;
