import express from "express";
import {
    unifiedCheckout,
    returnBook,
    renewBook,
    getMyTransactions,
    getAllTransactions,
    getSingleTransaction,
    getTransactionReturnDetails,
    softDeleteTransaction,
    restoreTransaction,
    getDeletedTransactions,
    permanentDeleteTransaction,
} from "../controller/bookTransaction.controller.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// POST /api/transactions/borrow — Unified Checkout (Walk-ins & Reservations)
router.post("/borrow", auth, roleAuth("librarian", "admin"), unifiedCheckout);

// PUT /api/transactions/:id/return
router.put("/:id/return", auth, roleAuth("librarian", "admin"), returnBook);

// PUT /api/transactions/:id/renew
router.put("/:id/renew", auth, roleAuth("student", "teacher"), renewBook);

// PUT /api/transactions/:id/restore — restore from recycle bin
router.put("/:id/restore", auth, roleAuth("librarian", "admin"), restoreTransaction);

// GET /api/transactions/my — own history (student/teacher)
router.get("/my", auth, roleAuth("student", "teacher"), getMyTransactions);

// GET /api/transactions/deleted — recycle bin (librarian/admin)
router.get("/deleted", auth, roleAuth("librarian", "admin"), getDeletedTransactions);

// GET /api/transactions — all (admin/librarian), supports ?status=&userId=
router.get("/", auth, roleAuth("librarian", "admin"), getAllTransactions);

// GET /api/transactions/:id/return-details — full return info (librarian/admin)
router.get("/:id/return-details", auth, roleAuth("librarian", "admin"), getTransactionReturnDetails);

// GET /api/transactions/:id — single transaction detail
router.get("/:id", auth, getSingleTransaction);

// DELETE /api/transactions/:id — soft delete (move to recycle bin)
router.delete("/:id", auth, roleAuth("librarian", "admin"), softDeleteTransaction);

// DELETE /api/transactions/:id/permanent — hard delete (admin only)
router.delete("/:id/permanent", auth, roleAuth("admin"), permanentDeleteTransaction);

export default router;
