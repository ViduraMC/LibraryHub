import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import upload from "../config/multer.js";
import {
    uploadStudentList,
    uploadTeacherList,
    getStudentList,
    getTeacherList,
} from "../controller/schoolList.controller.js";

const router = express.Router();

// all routes here are protected - admin only
router.post("/students/upload", auth, roleAuth("admin"), upload.single("file"), uploadStudentList);
router.post("/teachers/upload", auth, roleAuth("admin"), upload.single("file"), uploadTeacherList);
router.get("/students", auth, roleAuth("admin", "librarian"), getStudentList);
router.get("/teachers", auth, roleAuth("admin", "librarian"), getTeacherList);

export default router;
