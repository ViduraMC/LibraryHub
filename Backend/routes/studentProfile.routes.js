import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import * as studentController from "../controller/studentProfile.controller.js";

const router= express.Router();

router.get("/profile", auth, roleAuth("student"), studentController.getMyProfile);
router.patch("/profile", auth, roleAuth("student"), studentController.updateMyProfile);
router.patch("/profile/password", auth, roleAuth("student"), studentController.updateMyPassword);

export default router;