import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import upload from "../config/multer.js";
import {
    uploadStudentList,
    uploadTeacherList,
    getStudentList,
    getTeacherList,
    updateSchoolListEntry,
    deleteSchoolListEntry,
    clearSchoolList,
} from "../controller/schoolList.controller.js";

const router = express.Router();

// CSV upload (admin only)
router.post("/students/upload", auth, roleAuth("admin"), upload.single("file"), uploadStudentList);
router.post("/teachers/upload", auth, roleAuth("admin"), upload.single("file"), uploadTeacherList);

// read lists (admin + librarian)
router.get("/students", auth, roleAuth("admin", "librarian"), getStudentList);
router.get("/teachers", auth, roleAuth("admin", "librarian"), getTeacherList);

// clear all entries of a type (admin only) — MUST be before /:id to avoid conflict
router.delete("/clear/:type", auth, roleAuth("admin"), clearSchoolList);

// edit / delete individual entries (admin only)
router.put("/:id", auth, roleAuth("admin"), updateSchoolListEntry);
router.delete("/:id", auth, roleAuth("admin"), deleteSchoolListEntry);

export default router;

