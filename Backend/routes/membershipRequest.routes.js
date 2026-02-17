import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
    submitRequest,
    getRequests,
    getRequestById,
    approveRequest,
    rejectRequest,
} from "../controller/membershipRequest.controller.js";

const router = express.Router();

// public route - student/teacher submits registration request
router.post("/submit", submitRequest);

// protected routes - librarian and admin can view requests
router.get("/", auth, roleAuth("librarian", "admin"), getRequests);
router.get("/:id", auth, roleAuth("librarian", "admin"), getRequestById);

// librarian actions - approve or reject verified requests
router.put("/:id/approve", auth, roleAuth("librarian"), approveRequest);
router.put("/:id/reject", auth, roleAuth("librarian"), rejectRequest);

export default router;
