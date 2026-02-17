import express from "express";
import { login, setPassword } from "../controller/auth.controller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/set-password (public - token-based auth)
router.post("/set-password", setPassword);

export default router;

