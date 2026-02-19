import BookTransaction from "../models/bookTransaction.model.js";
import Book from "../models/book.model.js";
import User from "../models/user/user.model.js";
import mongoose from "mongoose";

// borrow a book
export const borrowBook = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const { bookId } = req.body;

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
        const maxBooks = userRole === "student" ? 3 : 5;
        const currentBorrows = await BookTransaction.countDocuments({
            userId,
            status: "active",
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

        const transaction = await BookTransaction.create({
            userId,
            bookId,
            borrowDate,
            dueDate,
        });

        // update book availability (native driver — skips Book model hooks)
        const booksCollection = mongoose.connection.db.collection("books");
        await booksCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(bookId) },
            {
                $inc: { availableCopies: -1 },
                $set: { available: book.availableCopies - 1 > 0 },
            }
        );

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

        // find the active transaction
        const transaction = await BookTransaction.findById(id);
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

        // increment book availability (native driver)
        const booksCollection = mongoose.connection.db.collection("books");
        await booksCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(transaction.bookId) },
            {
                $inc: { availableCopies: 1 },
                $set: { available: true },
            }
        );

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

// renew a borrow (student/teacher — 1 time only, +2 days)
export const renewBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const transaction = await BookTransaction.findById(id);
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

        const filter = { userId };
        if (status) filter.status = status;

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

        const filter = {};
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

        const transaction = await BookTransaction.findById(id)
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
