import express from "express";
import { login, setPassword, logout } from "../controller/auth.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/set-password (public - token-based auth)
router.post("/set-password", setPassword);

// POST /api/auth/logout (must be logged in)
router.post("/logout", auth, logout);

export default router;
