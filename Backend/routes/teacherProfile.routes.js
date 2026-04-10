import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";  
import * as teacherController from "../controller/teacherProfile.controller.js";

const router = express.Router();

router.get("/profile", auth, roleAuth("teacher"), teacherController.getMyProfile);
router.patch("/profile", auth, roleAuth("teacher"), teacherController.updateMyProfile);
router.patch("/profile/password", auth, roleAuth("teacher"), teacherController.updateMyPassword);



export default router;