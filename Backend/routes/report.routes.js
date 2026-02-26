import express from "express";

import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

import {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    restoreReport,
    permanentlyDeleteReport,
    finalizeReport,
    downloadReport
} from "../controller/report.controller.js";



const router = express.Router();

// POST /api/reports
router.post("/", auth, roleAuth("admin" ), createReport);

// GET /api/reports
router.get("/", auth, roleAuth("admin" ), getReports);

// GET /api/reports/:id/download
router.get("/:id/download", auth, roleAuth("admin" ), downloadReport);

// PATCH /api/reports/:id/finalize
router.patch("/:id/finalize", auth,roleAuth("admin" ), finalizeReport);

// PATCH /api/reports/:id/restore
router.patch("/:id/restore", auth, roleAuth("admin" ), restoreReport);

// DELETE /api/reports/:id/permanent
router.delete("/:id/permanent", auth, roleAuth("admin" ), permanentlyDeleteReport);

// GET /api/reports/:id
router.get("/:id", auth, roleAuth("admin" ), getReportById);

// PUT /api/reports/:id
router.put("/:id", auth, roleAuth("admin" ), updateReport);

// DELETE /api/reports/:id (soft delete)
router.delete("/:id", auth, roleAuth("admin" ), deleteReport);

export default router;