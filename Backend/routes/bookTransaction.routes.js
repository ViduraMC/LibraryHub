import express from "express";
import {
    borrowBook,
    returnBook,
    renewBook,
    getMyTransactions,
    getAllTransactions,
    getSingleTransaction,
} from "../controller/bookTransaction.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// POST /api/transactions/borrow
router.post("/borrow", auth, roleAuth("student", "teacher"), borrowBook);

// PUT /api/transactions/:id/return
router.put("/:id/return", auth, roleAuth("librarian", "admin"), returnBook);

// PUT /api/transactions/:id/renew
router.put("/:id/renew", auth, roleAuth("student", "teacher"), renewBook);

// GET /api/transactions/my — own history (student/teacher)
router.get("/my", auth, roleAuth("student", "teacher"), getMyTransactions);

// GET /api/transactions — all (admin/librarian), supports ?status=&userId=
router.get("/", auth, roleAuth("librarian", "admin"), getAllTransactions);

// GET /api/transactions/:id — single transaction detail
router.get("/:id", auth, getSingleTransaction);

export default router;
