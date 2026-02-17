import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import { createLibrarian, getAllLibrarians } from "../controller/admin.controller.js";

const router = express.Router();

// all routes here are protected - admin only
router.post("/librarian", auth, roleAuth("admin"), createLibrarian);
router.get("/librarians", auth, roleAuth("admin"), getAllLibrarians);

export default router;
