import BookTransaction from "../models/bookTransaction.model.js";
import Book from "../models/book.model.js";
import User from "../models/user/user.model.js";
import mongoose from "mongoose";

// borrow a book
export const borrowBook = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { bookId } = req.body; // same as const bookId = req.body.bookId

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required",
            });
        }

        // check book exists and has available copies
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                success: false,
                message: "No copies available for borrowing",
            });
        }

        // check borrowing limit (students: 3, teachers: 5)
        const maxBooks = userRole === "student" ? 3 : 5; //ternary operator
        const currentBorrows = await BookTransaction.countDocuments({
            userId,
            status: "active",
            isDeleted: false,
        });

        if (currentBorrows >= maxBooks) {
            return res.status(400).json({
                success: false,
                message: `Borrowing limit reached. ${userRole === "student" ? "Students" : "Teachers"} can borrow up to ${maxBooks} books at a time`,
            });
        }

        // check if user already has this book borrowed
        const alreadyBorrowed = await BookTransaction.findOne({
            userId,
            bookId,
            status: "active",
            isDeleted: false,
        });

        if (alreadyBorrowed) {
            return res.status(400).json({
                success: false,
                message: "You have already borrowed this book",
            });
        }

        // create the transaction (dueDate = 14 days from now)
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + 14);


        // CREATE transaction
        const transaction = await BookTransaction.create({
            userId,
            bookId,
            borrowDate,
            dueDate,
        });

        // update book availability using Mongoose
        book.availableCopies -= 1;
        await book.save();

        // update user's borrowed count
        await User.updateOne(
            { _id: userId },
            { $inc: { noOfBorrowedBooks: 1 } }
        );

        res.status(201).json({
            success: true,
            message: "Book borrowed successfully",
            transaction,
        });

    } catch (error) {
        console.error("Borrow book error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while borrowing book",
        });
    }
};

// return a book (librarian processes the return)
export const returnBook = async (req, res) => {
    try {
        const { id } = req.params;

        // find the active transaction (exclude deleted)
        const transaction = await BookTransaction.findOne({ _id: id, isDeleted: false });
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

        // set return date and check if late
        const returnDate = new Date();
        const isLate = returnDate > transaction.dueDate;

        transaction.returnDate = returnDate;
        transaction.status = "returned";
        transaction.isLate = isLate;
        await transaction.save();

        // increment book availability using Mongoose
        const book = await Book.findById(transaction.bookId);
        if (book) {
            book.availableCopies += 1;
            await book.save();
        }

        // decrement user's borrowed count
        await User.updateOne(
            { _id: transaction.userId },
            { $inc: { noOfBorrowedBooks: -1 } }
        );

        res.status(200).json({
            success: true,
            message: isLate
                ? "Book returned (overdue — returned after due date)"
                : "Book returned successfully",
            transaction,
        });
    } catch (error) {
        console.error("Return book error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while returning book",
        });
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
                message: `Cannot renew — transaction status is "${transaction.status}"`,
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
            .populate("userId", "fullName email role")
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
            .populate("bookId", "bookId name author grade type value")
            .populate("userId", "fullName email role");

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
            .populate("userId", "fullName email role")
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
