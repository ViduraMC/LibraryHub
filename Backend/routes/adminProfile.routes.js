import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
    getAdminProfile,
    updateAdminProfile,
    updateAdminPassword,
    getSystemStats,
} from "../controller/adminProfile.controller.js";

const router = express.Router();

router.get("/profile", auth, roleAuth("admin"), getAdminProfile);
router.patch("/profile", auth, roleAuth("admin"), updateAdminProfile);
router.patch("/profile/password", auth, roleAuth("admin"), updateAdminPassword);
router.get("/profile/system-stats", auth, roleAuth("admin"), getSystemStats);

export default router;
