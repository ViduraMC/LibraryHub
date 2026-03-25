import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
    createLibrarian,
    getAllLibrarians,
    updateLibrarian,
    toggleLibrarianStatus,
    deleteLibrarian,
    searchUserByMembershipId,
} from "../controller/admin.controller.js";

const router = express.Router();

// librarian management (admin only)
router.post("/librarian", auth, roleAuth("admin"), createLibrarian);
router.get("/librarians", auth, roleAuth("admin"), getAllLibrarians);
router.put("/librarian/:id", auth, roleAuth("admin"), updateLibrarian);
router.patch("/librarian/:id/status", auth, roleAuth("admin"), toggleLibrarianStatus);
router.delete("/librarian/:id", auth, roleAuth("admin"), deleteLibrarian);

// user lookup by membershipId (admin + librarian — needed for BorrowBookPage)
router.get("/user/search", auth, roleAuth("admin", "librarian"), searchUserByMembershipId);

export default router;

