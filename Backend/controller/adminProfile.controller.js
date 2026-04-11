import Admin from "../models/user/admin.model.js";
import User from "../models/user/user.model.js";
import Book from "../models/book.model.js";
import BookTransaction from "../models/bookTransaction.model.js";
import Fine from "../models/fine.model.js";
import MembershipRequest from "../models/membershipRequest.model.js";
import BookReservation from "../models/bookReservation.model.js";

// GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id).select(
            "fullName email phone address profileImageURL adminId isActive createdAt lastLoginAt"
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({ success: true, admin });
    } catch (error) {
        console.error("Get admin profile error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /api/admin/profile
export const updateAdminProfile = async (req, res) => {
    const allowedFields = ["phone", "address"];
    const updates = {};

    for (const key of allowedFields) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    try {
        const admin = await Admin.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("fullName email phone address");

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", admin });
    } catch (error) {
        console.error("Update admin profile error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /api/admin/profile/password
export const updateAdminPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({ success: false, message: "New password must differ from current password" });
    }

    try {
        const admin = await Admin.findById(req.user._id).select("+password");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Update admin password error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /api/admin/profile/system-stats
export const getSystemStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalTeachers,
            totalLibrarians,
            totalBooks,
            totalTransactions,
            activeTransactions,
            overdueTransactions,
            totalFines,
            unpaidFines,
            unpaidFineAmount,
            pendingMemberships,
            activeReservations,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "teacher" }),
            User.countDocuments({ role: "librarian" }),
            Book.countDocuments(),
            BookTransaction.countDocuments({ isDeleted: false }),
            BookTransaction.countDocuments({ status: "active", isDeleted: false }),
            BookTransaction.countDocuments({ status: "overdue", isDeleted: false }),
            Fine.countDocuments(),
            Fine.countDocuments({ fineStatus: "unpaid" }),
            Fine.aggregate([
                { $match: { fineStatus: "unpaid" } },
                { $group: { _id: null, total: { $sum: "$fineAmount" } } },
            ]),
            MembershipRequest.countDocuments({ status: "pending" }),
            BookReservation.countDocuments({ status: { $in: ["waiting", "reserved"] } }),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers,
                    librarians: totalLibrarians,
                },
                books: {
                    total: totalBooks,
                },
                transactions: {
                    total: totalTransactions,
                    active: activeTransactions,
                    overdue: overdueTransactions,
                },
                fines: {
                    total: totalFines,
                    unpaid: unpaidFines,
                    unpaidAmount: unpaidFineAmount[0]?.total || 0,
                },
                pendingMemberships,
                activeReservations,
            },
        });
    } catch (error) {
        console.error("Get system stats error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
