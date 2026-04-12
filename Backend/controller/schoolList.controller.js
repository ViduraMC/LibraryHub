import { Readable } from "stream";
import csvParser from "csv-parser";
import SchoolList from "../models/schoolList.model.js";

// parse CSV buffer into array of objects
const parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer.toString());

        stream
            .pipe(csvParser())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
};

// Validate that CSV columns match the expected type
// Students must have: schoolId, fullName (and optionally grade, classRoom)
// Teachers must have: schoolId, fullName (and optionally subject)
// Rejects if the CSV looks like it belongs to the other type
const validateCSVColumns = (rows, expectedType) => {
    if (rows.length === 0) return { valid: false, reason: "CSV file is empty" };

    // Get all column headers from the first row
    const columns = Object.keys(rows[0]).map((c) => c.toLowerCase().trim());

    // Must have schoolId column (or common variants)
    const hasSchoolId = columns.some((c) =>
        ["schoolid", "studentid", "teacherid"].includes(c)
    );
    if (!hasSchoolId) {
        return { valid: false, reason: "CSV must contain a 'schoolId' column" };
    }

    // Must have a name column
    const hasName = columns.some((c) =>
        ["fullname", "name"].includes(c)
    );
    if (!hasName) {
        return { valid: false, reason: "CSV must contain a 'fullName' or 'name' column" };
    }

    if (expectedType === "student") {
        // If uploading as student but CSV has 'subject' column and NO 'grade'/'classroom' → likely teacher CSV
        const hasSubject = columns.includes("subject");
        const hasGrade = columns.some((c) => ["grade", "classroom", "classRoom"].includes(c));

        if (hasSubject && !hasGrade) {
            return {
                valid: false,
                reason: "This CSV looks like a teacher list (has 'subject' column but no 'grade'/'classRoom'). Please upload it under Teachers instead.",
            };
        }
    }

    if (expectedType === "teacher") {
        // If uploading as teacher but CSV has 'grade'/'classroom' and NO 'subject' → likely student CSV
        const hasGrade = columns.some((c) => ["grade", "classroom", "classRoom"].includes(c));
        const hasSubject = columns.includes("subject");

        if (hasGrade && !hasSubject) {
            return {
                valid: false,
                reason: "This CSV looks like a student list (has 'grade'/'classRoom' columns but no 'subject'). Please upload it under Students instead.",
            };
        }
    }

    return { valid: true };
};

// upload student list CSV
export const uploadStudentList = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file",
            });
        }

        const rows = await parseCSV(req.file.buffer);

        // Validate columns match student format
        const validation = validateCSVColumns(rows, "student");
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason,
            });
        }

        let addedCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (const row of rows) {
            try {
                // CSV columns expected: schoolId, fullName, grade, classRoom
                await SchoolList.create({
                    type: "student",
                    schoolId: row.schoolId || row.StudentID || row.studentId,
                    fullName: row.fullName || row.FullName || row.name || row.Name,
                    grade: row.grade || row.Grade || "",
                    classRoom: row.classRoom || row.ClassRoom || row.class || "",
                    uploadedBy: req.user._id,
                });
                addedCount++;
            } catch (err) {
                if (err.code === 11000) {
                    skippedCount++;
                } else {
                    errors.push(`Row ${row.schoolId}: ${err.message}`);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Student list uploaded. Added: ${addedCount}, Skipped(duplicates): ${skippedCount}`,
            totalRows: rows.length,
            added: addedCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Upload student list error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// upload teacher list CSV
export const uploadTeacherList = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file",
            });
        }

        const rows = await parseCSV(req.file.buffer);

        // Validate columns match teacher format
        const validation = validateCSVColumns(rows, "teacher");
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason,
            });
        }

        let addedCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (const row of rows) {
            try {
                // CSV columns expected: schoolId, fullName, subject
                await SchoolList.create({
                    type: "teacher",
                    schoolId: row.schoolId || row.TeacherID || row.teacherId,
                    fullName: row.fullName || row.FullName || row.name || row.Name,
                    subject: row.subject || row.Subject || "",
                    uploadedBy: req.user._id,
                });
                addedCount++;
            } catch (err) {
                if (err.code === 11000) {
                    skippedCount++;
                } else {
                    errors.push(`Row ${row.schoolId}: ${err.message}`);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Teacher list uploaded. Added: ${addedCount}, Skipped(duplicates): ${skippedCount}`,
            totalRows: rows.length,
            added: addedCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Upload teacher list error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// get all students in school list
export const getStudentList = async (req, res) => {
    try {
        const students = await SchoolList.find({ type: "student" }).sort({ schoolId: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });
    } catch (error) {
        console.error("Get student list error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// get all teachers in school list
export const getTeacherList = async (req, res) => {
    try {
        const teachers = await SchoolList.find({ type: "teacher" }).sort({ schoolId: 1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers,
        });
    } catch (error) {
        console.error("Get teacher list error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// update a single school list entry (admin only)
export const updateSchoolListEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, grade, classRoom, subject } = req.body;

        const entry = await SchoolList.findById(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "School list entry not found",
            });
        }

        if (fullName) entry.fullName = fullName;
        if (entry.type === "student") {
            if (grade !== undefined) entry.grade = grade;
            if (classRoom !== undefined) entry.classRoom = classRoom;
        }
        if (entry.type === "teacher") {
            if (subject !== undefined) entry.subject = subject;
        }

        await entry.save();

        res.status(200).json({
            success: true,
            message: "Entry updated",
            entry,
        });
    } catch (error) {
        console.error("Update school list entry error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// delete a single school list entry (admin only)
export const deleteSchoolListEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await SchoolList.findByIdAndDelete(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "School list entry not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Entry deleted",
        });
    } catch (error) {
        console.error("Delete school list entry error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// clear all entries of a specific type (admin only)
// Used to wipe wrongly uploaded data (e.g. student CSV uploaded to teacher list)
export const clearSchoolList = async (req, res) => {
    try {
        const { type } = req.params;

        if (!["student", "teacher"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be 'student' or 'teacher'",
            });
        }

        const result = await SchoolList.deleteMany({ type });

        res.status(200).json({
            success: true,
            message: `All ${type} records cleared (${result.deletedCount} entries removed)`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Clear school list error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
