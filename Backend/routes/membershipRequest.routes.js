import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
    submitRequest,
    getRequests,
    getRequestById,
} from "../controller/membershipRequest.controller.js";

const router = express.Router();

// public route - student/teacher submits registration request
router.post("/submit", submitRequest);

// protected routes - librarian and admin can view requests
router.get("/", auth, roleAuth("librarian", "admin"), getRequests);
router.get("/:id", auth, roleAuth("librarian", "admin"), getRequestById);

export default router;
