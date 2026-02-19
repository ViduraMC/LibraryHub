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
