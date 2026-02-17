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

// upload student list CSV
export const uploadStudentList = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file",
            });
        }

        // parse the CSV file
        const rows = await parseCSV(req.file.buffer);

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "CSV file is empty",
            });
        }

        // prepare records for database
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
                    // duplicate key - student already in list
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
        console.error("Upload student list error:", error.message);
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

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "CSV file is empty",
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
        console.error("Upload teacher list error:", error.message);
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
