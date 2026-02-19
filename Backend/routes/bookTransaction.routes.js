import express from "express";
import { borrowBook, returnBook, renewBook } from "../controller/bookTransaction.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// POST /api/transactions/borrow — students and teachers can borrow
router.post("/borrow", auth, roleAuth("student", "teacher"), borrowBook);

// PUT /api/transactions/:id/return — librarian/admin processes the return
router.put("/:id/return", auth, roleAuth("librarian", "admin"), returnBook);

// PUT /api/transactions/:id/renew — student/teacher renews their own borrow (1 time only)
router.put("/:id/renew", auth, roleAuth("student", "teacher"), renewBook);

export default router;
