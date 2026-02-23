import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
    calculateOverdueFines,
    getUserFines,
    getAllUnpaidFines,
    getFineById,
    getFineStatistics,
    checkUnpaidFines,
    markFinePaid,
    cancelFine,
    refundFine,
    deleteFine,
} from "../controller/fine.controller.js";

const router = express.Router();

// CREATE
router.post(
    "/calculate",
    auth,
    roleAuth("admin", "librarian"),
    calculateOverdueFines
);

// READ
router.get("/my-fines", auth, async (req, res) => {
    req.params.userId = req.user._id;
    return getUserFines(req, res);
});

router.get("/check-unpaid", auth, async (req, res) => {
    req.params.userId = req.user._id;
    return checkUnpaidFines(req, res);
});

router.get(
    "/statistics",
    auth,
    roleAuth("admin", "librarian"),
    getFineStatistics
);

router.get(
    "/all-unpaid",
    auth,
    roleAuth("admin", "librarian"),
    getAllUnpaidFines
);

router.get(
    "/user/:userId",
    auth,
    roleAuth("admin", "librarian"),
    getUserFines
);

router.get(
    "/:fineId",
    auth,
    roleAuth("admin", "librarian"),
    getFineById
);

// UPDATE
router.patch(
    "/:fineId/pay",
    auth,
    roleAuth("admin", "librarian"),
    markFinePaid
);

router.patch(
    "/:fineId/cancel",
    auth,
    roleAuth("admin"),
    cancelFine
);

router.patch(
    "/:fineId/refund",
    auth,
    roleAuth("admin"),
    refundFine
);

// DELETE
router.delete(
    "/:fineId",
    auth,
    roleAuth("admin"),
    deleteFine
);

export default router;