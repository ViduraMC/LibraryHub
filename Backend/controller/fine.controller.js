import Fine from "../models/fine.model.js";
import BookTransaction from "../models/bookTransaction.model.js";
import sendEmail from "../config/email.js";

const DAILY_FINE_RATE = 5;

export const calculateOverdueFines = async (req, res) => {
    try {
        const currentDate = new Date();

        const lateTransactions = await BookTransaction.find({
            returnDate: null,
            status: { $in: ["active", "overdue"] },
            dueDate: { $lt: currentDate },
        }).populate("userId bookId");


        console.log(`Found ${lateTransactions.length} late transactions for fine calculation`);

        let finesCreated = 0;
        let finesUpdated = 0;
        let statusesUpdated = 0;
        const results = [];

        for (const transaction of lateTransactions) {
            try {
                // Bug #2 fix: flip "active" → "overdue" so the Overdue tab works
                if (transaction.status === "active") {
                    transaction.status = "overdue";
                    await transaction.save();
                    statusesUpdated++;
                }

                const existingFine = await Fine.findOne({
                    bookTransactionId: transaction._id,
                });

                const daysOverdue = Math.floor(
                    (currentDate - transaction.dueDate) / (1000 * 60 * 60 * 24)
                );

                const fineAmount = daysOverdue * DAILY_FINE_RATE;

                if (existingFine) {
                    // Bug #3 fix: never touch a fine that has already been settled
                    if (existingFine.fineStatus !== "unpaid") {
                        results.push({
                            action: "skipped",
                            fineId: existingFine._id,
                            reason: `Fine already ${existingFine.fineStatus}`,
                        });
                        continue;
                    }

                    if (
                        existingFine.daysOverdue !== daysOverdue ||
                        existingFine.fineAmount !== fineAmount
                    ) {
                        existingFine.daysOverdue = daysOverdue;
                        existingFine.fineAmount = fineAmount;
                        await existingFine.save();

                        finesUpdated++;
                        results.push({
                            action: "updated",
                            fineId: existingFine._id,
                            bookTransactionId: transaction._id,
                            daysOverdue,
                            fineAmount,
                        });
                    }
                } else {
                    const newFine = await Fine.create({
                        bookTransactionId: transaction._id,
                        userId: transaction.userId._id,
                        bookId: transaction.bookId._id,
                        daysOverdue,
                        fineAmount,
                        fineStatus: "unpaid",
                    });

                    finesCreated++;
                    results.push({
                        action: "created",
                        fineId: newFine._id,
                        bookTransactionId: transaction._id,
                        userId: transaction.userId._id,
                        daysOverdue,
                        fineAmount,
                    });
                }
            } catch (error) {
                console.error(`Error processing transaction ${transaction._id}:`, error.message);
                results.push({
                    action: "error",
                    bookTransactionId: transaction._id,
                    error: error.message,
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Fine calculation completed. ${finesCreated} new, ${finesUpdated} updated, ${statusesUpdated} marked overdue`,
            summary: {
                totalProcessed: lateTransactions.length,
                finesCreated,
                finesUpdated,
                statusesUpdated,
            },
            results,
        });
    } catch (error) {
        console.error("Calculate fines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error during fine calculation",
        });
    }
};

export const getUserFines = async (req, res) => {
    try {
        const { userId } = req.params;

        const fines = await Fine.find({ userId })
            .populate("userId")
            .populate("bookTransactionId")
            .populate("bookId")
            .sort({ createdAt: -1 });

        const totalUnpaid = fines
            .filter((f) => f.fineStatus === "unpaid")
            .reduce((sum, f) => sum + f.fineAmount, 0);

        const totalPaid = fines
            .filter((f) => f.fineStatus === "paid")
            .reduce((sum, f) => sum + f.fineAmount, 0);

        const totalCancelled = fines
            .filter((f) => f.fineStatus === "cancelled")
            .reduce((sum, f) => sum + f.fineAmount, 0);

        res.status(200).json({
            success: true,
            count: fines.length,
            statistics: {
                totalUnpaid,
                totalPaid,
                totalCancelled,
            },
            fines,
        });
    } catch (error) {
        console.error("Get user fines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getAllUnpaidFines = async (req, res) => {
    try {
        const fines = await Fine.find({ fineStatus: "unpaid" })
            .populate("userId")
            .populate("bookTransactionId")
            .populate("bookId")
            .sort({ createdAt: -1 });

        const totalAmount = fines.reduce((sum, f) => sum + f.fineAmount, 0);

        res.status(200).json({
            success: true,
            count: fines.length,
            totalAmount,
            fines,
        });
    } catch (error) {
        console.error("Get all unpaid fines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get all fines with optional status filter (?status=paid, ?status=cancelled, etc.)
export const getAllFines = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) filter.fineStatus = status;

        const fines = await Fine.find(filter)
            .populate("userId")
            .populate("bookTransactionId")
            .populate("bookId")
            .populate("paidBy")
            .populate("cancelledBy")
            .sort({ createdAt: -1 });

        const totalAmount = fines.reduce((sum, f) => sum + f.fineAmount, 0);

        res.status(200).json({
            success: true,
            count: fines.length,
            totalAmount,
            fines,
        });
    } catch (error) {
        console.error("Get all fines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Update a fine's amount or days overdue (librarian/admin)
export const updateFine = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { fineAmount, daysOverdue } = req.body;

        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        // only unpaid fines can be edited
        if (fine.fineStatus !== "unpaid") {
            return res.status(400).json({
                success: false,
                message: `Cannot edit a fine that is already ${fine.fineStatus}`,
            });
        }

        if (fineAmount !== undefined) {
            if (fineAmount < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Fine amount cannot be negative",
                });
            }
            fine.fineAmount = fineAmount;
        }

        if (daysOverdue !== undefined) {
            if (daysOverdue < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Days overdue cannot be negative",
                });
            }
            fine.daysOverdue = daysOverdue;
        }

        await fine.save();

        const updatedFine = await Fine.findById(fineId)
            .populate("userId")
            .populate("bookTransactionId")
            .populate("bookId");

        res.status(200).json({
            success: true,
            message: "Fine updated successfully",
            fine: updatedFine,
        });
    } catch (error) {
        console.error("Update fine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getFineById = async (req, res) => {
    try {

        //Take the fineId value from the URL and store it in a variable called fineId ==>> http://localhost:5000/fine/12345
        //const fineId = req.params.fineId;
        const { fineId } = req.params;

        const fine = await Fine.findById(fineId)
            .populate("userId")
            .populate("bookTransactionId")
            .populate("bookId")
            .populate("paidBy");

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        res.status(200).json({
            success: true,
            fine,
        });
    } catch (error) {
        console.error("Get fine by ID error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getFineStatistics = async (req, res) => {
    try {
        const totalFines = await Fine.countDocuments();
        const unpaidFines = await Fine.countDocuments({ fineStatus: "unpaid" });
        const paidFines = await Fine.countDocuments({ fineStatus: "paid" });
        const cancelledFines = await Fine.countDocuments({ fineStatus: "cancelled" });

        const totalAmount = await Fine.aggregate([
            { $group: { _id: null, total: { $sum: "$fineAmount" } } },
        ]);

        const unpaidAmount = await Fine.aggregate([
            { $match: { fineStatus: "unpaid" } },
            { $group: { _id: null, total: { $sum: "$fineAmount" } } },
        ]);

        const paidAmount = await Fine.aggregate([
            { $match: { fineStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$fineAmount" } } },
        ]);

        const cancelledAmount = await Fine.aggregate([
            { $match: { fineStatus: "cancelled" } },
            { $group: { _id: null, total: { $sum: "$fineAmount" } } },
        ]);

        res.status(200).json({
            success: true,
            statistics: {
                totalFines,
                unpaidFines,
                paidFines,
                cancelledFines,
                totalAmount: totalAmount[0]?.total || 0,
                unpaidAmount: unpaidAmount[0]?.total || 0,
                paidAmount: paidAmount[0]?.total || 0,
                cancelledAmount: cancelledAmount[0]?.total || 0,
            },
        });
    } catch (error) {
        console.error("Get statistics error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const checkUnpaidFines = async (req, res) => {
    try {
        const { userId } = req.params;

        const unpaidFines = await Fine.find({
            userId,
            fineStatus: "unpaid",
        });

        const totalUnpaid = unpaidFines.reduce(
            (sum, fine) => sum + fine.fineAmount,
            0
        );

        res.status(200).json({
            success: true,
            hasUnpaidFines: unpaidFines.length > 0,
            count: unpaidFines.length,
            totalUnpaidAmount: totalUnpaid,
            canBorrow: unpaidFines.length === 0,
            message: unpaidFines.length > 0
                ? `Member has Rs. ${totalUnpaid} in unpaid fines. Cannot borrow.`
                : "No unpaid fines. Member can borrow.",
        });
    } catch (error) {
        console.error("Check unpaid fines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const markFinePaid = async (req, res) => {
    try {
        const { fineId } = req.params;

        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        if (fine.fineStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "This fine is already marked as paid",
            });
        }

        if (fine.fineStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "This fine was cancelled and cannot be marked as paid",
            });
        }

        fine.fineStatus = "paid";
        fine.paymentDate = new Date();
        fine.paidBy = req.user._id;

        await fine.save();

        await fine.populate("userId");

        const userEmail = fine.userId.email;
        const userName = fine.userId.fullName;

        const emailHtml = `
            <h2>Fine Payment Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Your library fine has been successfully paid and recorded.</p>
            <hr>
            <h3>Fine Details:</h3>
            <ul>
                <li><strong>Fine Amount:</strong> Rs. ${fine.fineAmount}</li>
                <li><strong>Days Overdue:</strong> ${fine.daysOverdue}</li>
                <li><strong>Payment Date:</strong> ${fine.paymentDate.toLocaleDateString()}</li>
                <li><strong>Status:</strong> PAID</li>
            </ul>
            <hr>
            <p>Your account is now clear. You can borrow books again without any restrictions.</p>
            <br>
            <p>Thank you for your cooperation!</p>
            <p>Best regards,<br>📚 LibraryHub</p>
        `;

        await sendEmail(userEmail, "Fine Payment Confirmation", emailHtml);

        res.status(200).json({
            success: true,
            message: "Fine marked as paid successfully",
            fine,
        });
    } catch (error) {
        console.error("Mark fine paid error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const cancelFine = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { cancellationReason } = req.body;

        if (!cancellationReason) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required",
            });
        }

        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        if (fine.fineStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a fine that has already been paid",
            });
        }

        if (fine.fineStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "This fine is already cancelled",
            });
        }

        fine.fineStatus = "cancelled";
        fine.cancellationReason = cancellationReason;
        fine.cancelledBy = req.user._id;
        fine.cancellationDate = new Date();

        await fine.save();

        await fine.populate("userId");

        const userEmail = fine.userId.email;
        const userName = fine.userId.fullName;

        const emailHtml = `
            <h2>Fine Cancellation Notice</h2>
            <p>Dear ${userName},</p>
            <p>Your library fine has been cancelled and waived.</p>
            <hr>
            <h3>Fine Details:</h3>
            <ul>
                <li><strong>Fine Amount (Waived):</strong> Rs. ${fine.fineAmount}</li>
                <li><strong>Days Overdue:</strong> ${fine.daysOverdue}</li>
                <li><strong>Cancellation Date:</strong> ${fine.cancellationDate.toLocaleDateString()}</li>
                <li><strong>Reason:</strong> ${cancellationReason}</li>
                <li><strong>Status:</strong> CANCELLED (Waived)</li>
            </ul>
            <hr>
            <p>Your account is now clear. You can borrow books again.</p>
            <br>
            <p>Best regards,<br>📚 LibraryHub</p>
        `;

        await sendEmail(userEmail, "Fine Cancellation Notice", emailHtml);

        res.status(200).json({
            success: true,
            message: "Fine cancelled successfully",
            fine,
        });
    } catch (error) {
        console.error("Cancel fine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const refundFine = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { refundAmount, refundReason } = req.body;

        if (!refundAmount || refundAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid refund amount required",
            });
        }

        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        if (fine.fineStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Only paid fines can be refunded",
            });
        }

        if (refundAmount > fine.fineAmount) {
            return res.status(400).json({
                success: false,
                message: `Refund amount cannot exceed fine amount (Rs. ${fine.fineAmount})`,
            });
        }

        fine.fineStatus = "refunded";
        fine.refundAmount = refundAmount;
        fine.refundReason = refundReason;
        fine.refundedBy = req.user._id;
        fine.refundDate = new Date();

        await fine.save();

        await fine.populate("userId");

        const userEmail = fine.userId.email;
        const userName = fine.userId.fullName;

        const emailHtml = `
            <h2>Fine Refund Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Your refund has been processed successfully.</p>
            <hr>
            <h3>Refund Details:</h3>
            <ul>
                <li><strong>Original Fine:</strong> Rs. ${fine.fineAmount}</li>
                <li><strong>Refund Amount:</strong> Rs. ${refundAmount}</li>
                <li><strong>Refund Date:</strong> ${fine.refundDate.toLocaleDateString()}</li>
                <li><strong>Status:</strong> REFUNDED</li>
            </ul>
            <hr>
            <p>The refund will be credited to your account within 3-5 business days.</p>
            <br>
            <p>Thank you!</p>
            <p>Best regards,<br>📚 LibraryHub</p>
        `;

        await sendEmail(userEmail, "Fine Refund Confirmation", emailHtml);

        res.status(200).json({
            success: true,
            message: "Refund processed successfully",
            fine,
        });
    } catch (error) {
        console.error("Refund fine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const deleteFine = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { confirmDelete } = req.body;

        if (confirmDelete !== true) {
            return res.status(400).json({
                success: false,
                message: "Confirmation required. Send { confirmDelete: true } in body",
            });
        }

        const fine = await Fine.findByIdAndDelete(fineId);

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found",
            });
        }

        console.warn(`ADMIN: Fine ${fineId} was permanently deleted by ${req.user._id}`);

        res.status(200).json({
            success: true,
            message: "Fine permanently deleted",
            deletedFine: fine,
        });
    } catch (error) {
        console.error("Delete fine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};