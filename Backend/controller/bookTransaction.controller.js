import BookTransaction from "../models/bookTransaction.model.js";
import Book from "../models/book.model.js";
import User from "../models/user/user.model.js";
import BookReservation from "../models/bookReservation.model.js";
import Fine from "../models/fine.model.js";
import mongoose from "mongoose";

// borrow a book (unified flow for walk-ins and reservation pickups)
export const unifiedCheckout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookId, userId } = req.body;

        // check user and book exists
        const user = await User.findById(userId).session(session);
        const book = await Book.findById(bookId).session(session);
        if (!user || !book) {
            return res.status(404).json({
                success: false,
                message: "User or Book not found",
            });
        }

        // check borrowing limit (students: 3, teachers: 5)
        const maxBooks = user.role === "student" ? 3 : 5;
        if (user.noOfBorrowedBooks >= maxBooks) {
            return res.status(400).json({
                success: false,
                message: `Borrowing limit reached. ${user.role === "student" ? "Students" : "Teachers"} can borrow up to ${maxBooks} books at a time`,
            });
        }

        // check for unpaid fines
        const hasFines = await Fine.findOne({ userId, fineStatus: "unpaid" }).session(session);
        if (hasFines) {
            return res.status(400).json({
                success: false,
                message: "User has unpaid fines",
            });
        }

        // check if this is a reservation pickup
        const reservation = await BookReservation.findOne({
            userId, bookId, status: "reserved"
        }).session(session);

        if (reservation) {
            // mark reservation as collected
            reservation.status = "collected";
            reservation.collectedAt = new Date();
            await reservation.save({ session });

            // Bug #6 fix: decrement availableCopies on reservation pickup
            // (the copy was not held during reservation, only during borrow)
            if (book.availableCopies > 0) {
                book.availableCopies -= 1;
                await book.save({ session });
            }
        } else {
            // walk-in borrow flow
            // check if someone else is waiting in the queue
            const isQueued = await BookReservation.findOne({ bookId, status: "waiting" }).session(session);
            if (isQueued) {
                return res.status(400).json({
                    success: false,
                    message: "Walk-in denied: This book is reserved for the waiting list",
                });
            }

            // check available copies
            if (book.availableCopies <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "No copies available",
                });
            }

            // update book availability
            book.availableCopies -= 1;
            await book.save({ session });
        }

        // create the transaction (dueDate = 14 days from now)
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + 14);

        // CREATE transaction
        const transaction = await BookTransaction.create([{
            userId,
            bookId,
            reservationId: reservation ? reservation._id : null,
            borrowDate,
            dueDate,
            status: "active"
        }], { session });

        // update user's borrowed count
        await User.findByIdAndUpdate(
            userId,
            { $inc: { noOfBorrowedBooks: 1 } },
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Book issued!", data: transaction[0] });

    } catch (error) {
        console.error("unifiedCheckout Error:", error.message);
        await session.abortTransaction();
        res.status(500).json({ error: "Checkout failed" });
    } finally {
        session.endSession();
    }
};

// return a book (librarian processes the return, fulfills waiting list)
export const returnBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // find the active transaction (exclude deleted)
        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false }).session(session);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        if (transaction.status !== "active" && transaction.status !== "overdue") {
            return res.status(400).json({
                success: false,
                message: `Cannot return — transaction status is "${transaction.status}"`,
            });
        }

        // check for unpaid fines on this specific transaction
        const unpaidFine = await Fine.findOne({
            bookTransactionId: id,
            fineStatus: "unpaid",
        }).session(session);

        if (unpaidFine) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Cannot return: unpaid fine of Rs.${unpaidFine.fineAmount.toFixed(2)}. Fine must be settled first.`,
                fine: unpaidFine,
            });
        }

        // Bug #5 fix: finalize fine amounts at the actual return moment
        // If a fine exists (paid/cancelled) for this transaction, lock in the final overdue days
        const settledFine = await Fine.findOne({
            bookTransactionId: id,
            fineStatus: { $in: ["paid", "cancelled"] },
        }).session(session);

        if (settledFine) {
            const actualDays = Math.floor((new Date() - transaction.dueDate) / (1000 * 60 * 60 * 24));
            if (actualDays > 0) {
                settledFine.daysOverdue = actualDays;
                await settledFine.save({ session });
            }
        }

        // set return date and check if late
        const returnDate = new Date();
        const isLate = returnDate > transaction.dueDate;

        transaction.returnDate = returnDate;
        transaction.status = "returned";
        transaction.isLate = isLate;
        await transaction.save({ session });

        // update reservation if this was a reserved borrow
        if (transaction.reservationId) {
            await BookReservation.findByIdAndUpdate(
                transaction.reservationId,
                { status: "completed" },
                { session }
            );
        }

        // decrement user's borrowed count
        await User.findByIdAndUpdate(
            transaction.userId,
            { $inc: { noOfBorrowedBooks: -1 } },
            { session }
        );

        // check waiting list and update book availability
        const nextInLine = await BookReservation.findOne({
            bookId: transaction.bookId,
            status: "waiting"
        }).sort({ queuePosition: 1 }).session(session);

        let returnMessage = isLate ? "Book returned (overdue — returned after due date)." : "Book returned successfully.";

        if (nextInLine) {
            // give book to next person in waiting list (keep library availableCopies the same)
            nextInLine.status = "reserved";
            nextInLine.queuePosition = 0;
            nextInLine.reservedAt = new Date();
            nextInLine.expiredDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await nextInLine.save({ session });

            // shift everyone else up in the queue
            await BookReservation.updateMany(
                { bookId: transaction.bookId, status: "waiting" },
                { $inc: { queuePosition: -1 } },
                { session }
            );
            returnMessage += " Book assigned to next user in waiting queue!";
        } else {
            // nobody waiting, put book back on shelf
            const book = await Book.findById(transaction.bookId).session(session);
            if (book) {
                book.availableCopies += 1;
                await book.save({ session });
            }
            returnMessage += " Book returned to shelf.";
        }

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: returnMessage,
            transaction,
        });

    } catch (error) {
        console.error("Return book error:", error.message);
        await session.abortTransaction();
        res.status(500).json({
            success: false,
            message: "Server error while returning book",
        });
    } finally {
        session.endSession();
    }
};

// UPDATE--> renew a borrow (student/teacher — 1 time only, +2 days)
export const renewBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        // only the borrower can renew their own book
        if (transaction.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only renew your own borrowed books",
            });
        }

        if (transaction.status !== "active") {
            return res.status(400).json({
                success: false,
                message: `Cannot renew: transaction status is "${transaction.status}"`,
            });
        }

        // Bug #4 fix: block renewal if the book is already past its due date
        if (new Date() > transaction.dueDate) {
            return res.status(400).json({
                success: false,
                message: "Cannot renew: this book is already overdue. Please return it to the library.",
            });
        }

        // only 1 renewal allowed
        if (transaction.renewed) {
            return res.status(400).json({
                success: false,
                message: "This book has already been renewed. Renewal is allowed only once",
            });
        }

        // extend dueDate by +2 days
        const newDueDate = new Date(transaction.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 2);

        transaction.dueDate = newDueDate;
        transaction.renewed = true;
        transaction.renewedAt = new Date();
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Book renewed successfully. New due date: " + newDueDate.toDateString(),
            transaction,
        });
    } catch (error) {
        console.error("Renew book error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while renewing book",
        });
    }
};

// get my own transaction history (student/teacher)
export const getMyTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        const filter = { userId, isDeleted: false }; // Baseline rules; must always be true
        if (status) filter.status = status; // Add optional rules if needed

        const transactions = await BookTransaction.find(filter)
            .populate("bookId", "bookId name author grade type")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    } catch (error) {
        console.error("Get my transactions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching transactions",
        });
    }
};

// get all transactions (librarian/admin)
export const getAllTransactions = async (req, res) => {
    try {
        const { status, userId } = req.query;

        const filter = { isDeleted: false };
        if (status) filter.status = status;
        if (userId) filter.userId = userId;

        const transactions = await BookTransaction.find(filter)
            .populate("bookId", "bookId name author grade")
            .populate("userId", "fullName email role membershipId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    } catch (error) {
        console.error("Get all transactions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching transactions",
        });
    }
};

// get single transaction by ID
export const getSingleTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false })
            .populate("bookId", "bookId name author grade type value availableCopies totalCopies")
            .populate("userId", "fullName email role membershipId");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            transaction,
        });
    } catch (error) {
        console.error("Get single transaction error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching transaction",
        });
    }
};

// get full return details for a transaction (used by the return confirmation modal)
// combines transaction + book (with availability) + user + fine data
export const getTransactionReturnDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false })
            .populate("bookId", "bookId name author grade type value availableCopies totalCopies")
            .populate("userId", "fullName email role membershipId");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        // check for fine on this transaction
        const fine = await Fine.findOne({ bookTransactionId: id });

        // calculate overdue days
        const now = new Date();
        const dueDate = new Date(transaction.dueDate);
        let overdueDays = 0;
        if (now > dueDate && (transaction.status === "active" || transaction.status === "overdue")) {
            overdueDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        }

        res.status(200).json({
            success: true,
            transaction,
            fine: fine || null,
            overdueDays,
        });
    } catch (error) {
        console.error("Get return details error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching return details",
        });
    }
};

// soft delete a transaction (move to recycle bin)
export const softDeleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found or already deleted",
            });
        }

        // if active or overdue → reverse the side effects
        if (transaction.status === "active" || transaction.status === "overdue") {
            // give the copy back to the book
            const book = await Book.findById(transaction.bookId);
            if (book) {
                book.availableCopies += 1;
                await book.save();
            }

            // decrease user's borrow count
            await User.updateOne(
                { _id: transaction.userId },
                { $inc: { noOfBorrowedBooks: -1 } }
            );

            // Bug #7 fix: cancel any orphaned unpaid fine for this transaction
            const orphanedFine = await Fine.findOne({
                bookTransactionId: transaction._id,
                fineStatus: "unpaid",
            });
            if (orphanedFine) {
                orphanedFine.fineStatus = "cancelled";
                orphanedFine.cancellationReason = "Transaction soft-deleted by librarian";
                orphanedFine.cancelledBy = req.user._id;
                orphanedFine.cancellationDate = new Date();
                await orphanedFine.save();
            }
        }

        transaction.isDeleted = true;
        transaction.deletedAt = new Date();
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Transaction moved to recycle bin",
            transaction,
        });
    } catch (error) {
        console.error("Soft delete error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while deleting transaction",
        });
    }
};

// restore a soft-deleted transaction
export const restoreTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: true });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Deleted transaction not found",
            });
        }

        // if was active or overdue → re-apply the side effects
        if (transaction.status === "active" || transaction.status === "overdue") {
            // check book still has copies to take
            const book = await Book.findById(transaction.bookId);
            if (!book || book.availableCopies <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot restore — book has no available copies",
                });
            }

            // take back the copy from the book
            book.availableCopies -= 1;
            await book.save();

            // increase user's borrow count
            await User.updateOne(
                { _id: transaction.userId },
                { $inc: { noOfBorrowedBooks: 1 } }
            );
        }

        transaction.isDeleted = false;
        transaction.deletedAt = null;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Transaction restored successfully",
            transaction,
        });
    } catch (error) {
        console.error("Restore transaction error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while restoring transaction",
        });
    }
};

// view recycle bin (soft-deleted transactions)
export const getDeletedTransactions = async (req, res) => {
    try {
        const transactions = await BookTransaction.find({ isDeleted: true })
            .populate("bookId", "bookId name author grade")
            .populate("userId", "fullName email role membershipId")
            .sort({ deletedAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    } catch (error) {
        console.error("Get deleted transactions error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching deleted transactions",
        });
    }
};

// permanently delete a transaction (admin only — must be in recycle bin first)
export const permanentDeleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: true });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found in recycle bin. Soft-delete it first",
            });
        }

        await BookTransaction.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Transaction permanently deleted",
        });
    } catch (error) {
        console.error("Permanent delete error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while permanently deleting transaction",
        });
    }
};
