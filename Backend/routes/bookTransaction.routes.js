import express from "express";
import { borrowBook, returnBook } from "../controller/bookTransaction.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// POST /api/transactions/borrow — students and teachers can borrow
router.post("/borrow", auth, roleAuth("student", "teacher"), borrowBook);

// PUT /api/transactions/:id/return — librarian processes the return
router.put("/:id/return", auth, roleAuth("librarian", "admin"), returnBook);

export default router;
