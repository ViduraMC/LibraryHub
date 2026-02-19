import express from "express";
import { borrowBook } from "../controller/bookTransaction.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// POST /api/transactions/borrow — students and teachers can borrow
router.post("/borrow", auth, roleAuth("student", "teacher"), borrowBook);

export default router;
