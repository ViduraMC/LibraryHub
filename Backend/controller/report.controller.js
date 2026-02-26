import Report from "../models/report.model.js";
import User from "../models/user/user.model.js";


// placeholder functions for your calculations
const calculateTotalBooks = async (start, end) => {
    return 100; 
};
const calculateNetBooks = async (start, end) => {
    return 80;
};
const calculateLostBooks = async (start, end) => {
    return 5;
};
const calculateNewUsers = async (start, end) => {
    return 10;
};

// CREATE / GENERATE REPORT 
export const createReport = async (req, res) => {
    try {
        const { 
            title, 
            type, 
            periodStart, 
            periodEnd 
        } = req.body;

        if (!title || !type || !periodStart || !periodEnd) {
            return res.status(400).json({
                success: false,
                message: "Title, type, periodStart, and periodEnd are required",
            });
        }

        // Optional: Validate dates on creation
        if (new Date(periodStart) > new Date(periodEnd)) {
            return res.status(400).json({
                success: false,
                message: "periodStart cannot be later than periodEnd",
            });
        }

        // Example: calculate report stats
        const totalBooks = await calculateTotalBooks(periodStart, periodEnd);
        const netBooks = await calculateNetBooks(periodStart, periodEnd);
        const lostBooks = await calculateLostBooks(periodStart, periodEnd);
        const totalNewUsers = await calculateNewUsers(periodStart, periodEnd);

        const report = await Report.create({
            title,
            type,
            periodStart,
            periodEnd,
            totalBooks,
            lostBooks,
            totalNewUsers,
            generatedBy: req.user._id,
            isFinalized: false,
            status: "active",
            archivedAt: null,
        });

        res.status(201).json({
            success: true,
            message: "Report generated successfully",
            report,
        });
    } catch (error) {
        console.error("Create report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET ALL REPORTS 
export const getReports = async (req, res) => {
    try {
        const { archived } = req.query; // ?archived=true

        const filter = {};
        if (archived === "true") filter.status = "archived";
        else filter.status = "active";

        const reports = await Report.find(filter)
            .sort({ createdAt: -1 })
            .populate("generatedBy", "fullName email role");

        res.status(200).json({ success: true, count: reports.length, reports });
    } catch (error) {
        console.error("Get reports error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET REPORT BY ID 
export const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("generatedBy", "fullName email role");

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.status(200).json({ success: true, report });
    } catch (error) {
        console.error("Get report by ID error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//  UPDATE REPORT 
export const updateReport = async (req, res) => {
    try {
        const { title, 
                periodStart, 
                periodEnd 
            } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        if (report.isFinalized) {
            return res.status(400).json({
                success: false,
                message: "Cannot update a finalized report",
            });
        }

        if (report.status==="archived") {
            return res.status(400).json({
                success: false,
                message: "Cannot update an archived report. Please restore it first.",
            });
        }

        // Update editable fields
        if (title !== undefined) report.title = title;
        if (periodStart !== undefined) report.periodStart = periodStart;
        if (periodEnd !== undefined) report.periodEnd = periodEnd;

        // Validate dates only if they exist
        const start = new Date(report.periodStart);
        const end = new Date(report.periodEnd);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format for periodStart or periodEnd",
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "periodStart cannot be later than periodEnd",
            });
        }

        // Recalculate stats only if period changed
        if (periodStart !== undefined || periodEnd !== undefined) {

            const [totalBooks, netBooks, lostBooks, totalNewUsers] = await Promise.all([
                calculateTotalBooks(start, end),
                calculateNetBooks(start, end),
                calculateLostBooks(start, end),
                calculateNewUsers(start, end)
            ]);

            report.totalBooks = totalBooks;
            report.netBooks = netBooks;
            report.lostBooks = lostBooks;
            report.totalNewUsers = totalNewUsers;
        }

        await report.save();

        res.status(200).json({
            success: true,
            message: "Report updated successfully",
            report
        });

    } catch (error) {
        console.error("Update report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// FINALIZE REPORT
export const finalizeReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        if (report.isFinalized) return res.status(400).json({ success: false, message: "Report is already finalized" });

        report.isFinalized = true;
        report.finalizedAt = new Date();
        await report.save();

        res.status(200).json({ success: true, message: "Report finalized successfully", report });
    } catch (error) {
        console.error("Finalize report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE REPORT (ARCHIVE)
export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        report.status = "archived";
        report.archivedAt = new Date();
        await report.save();

        res.status(200).json({ success: true, message: "Report archived successfully" });
    } catch (error) {
        console.error("Delete report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// RESTORE REPORT FROM ARCHIVE
export const restoreReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        if (report.status !== "archived") return res.status(400).json({ success: false, message: "Report is not archived" });

        report.status = "active";
        report.archivedAt = null;
        await report.save();

        res.status(200).json({ success: true, message: "Report restored successfully", report });
    } catch (error) {
        console.error("Restore report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PERMANENT DELETE
export const permanentlyDeleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        if (report.status !== "archived") return res.status(400).json({ success: false, message: "Only archived reports can be permanently deleted" });

        await Report.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Report permanently deleted" });
    } catch (error) {
        console.error("Permanent delete error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DOWNLOAD REPORT
export const downloadReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("generatedBy", "fullName email");
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        const escapeCsv = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csvRows = [
            ["Field", "Value"],
            ["Report Title", report.title],
            ["Report Type", report.type],
            ["Status", report.isFinalized ? "Finalized" : "Draft"],
            ["Period Start", new Date(report.periodStart).toLocaleDateString()],
            ["Period End", new Date(report.periodEnd).toLocaleDateString()],
            ["Total Books", report.totalBooks],
            ["Net Books", report.netBooks],
            ["Lost Books", report.lostBooks],
            ["New Users", report.totalNewUsers],
            ["Generated By", report.generatedBy?.fullName || "System"],
            ["Generated On", new Date(report.createdAt).toLocaleString()],
        ]
        .map(row => row.map(escapeCsv).join(","))
        .join("\r\n");

        const safeFileName = report.title.replace(/[^\w\- ]/g, "").replace(/ /g, "_");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}_report.csv"`);

        res.status(200).send(csvRows);
    } catch (error) {
        console.error("Download report error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};