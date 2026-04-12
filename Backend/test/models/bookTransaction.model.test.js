import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

/**
 * BookTransaction Model — Unit Tests
 * Tests schema validation for book transactions: required fields, status enum, defaults.
 */
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required'],
    },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    returnDate: { type: Date },
    status: {
        type: String,
        enum: ['active', 'returned', 'overdue', 'lost'],
        default: 'active',
    },
    renewed: { type: Boolean, default: false },
    renewedAt: { type: Date },
    isLate: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
});

const Transaction =
    mongoose.models.TransactionTest || mongoose.model('TransactionTest', transactionSchema);

describe('BookTransaction Model — Schema Validation', () => {

    const validTransaction = () => ({
        userId: new mongoose.Types.ObjectId(),
        bookId: new mongoose.Types.ObjectId(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    });

    it('should require userId, bookId, and dueDate', () => {
        const doc = new Transaction({});
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.userId).toBeDefined();
        expect(err.errors.bookId).toBeDefined();
        expect(err.errors.dueDate).toBeDefined();
    });

    it('should pass validation with required fields', () => {
        const doc = new Transaction(validTransaction());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    it('should default status to "active"', () => {
        const doc = new Transaction(validTransaction());
        expect(doc.status).toBe('active');
    });

    it('should reject invalid status enum', () => {
        const doc = new Transaction({ ...validTransaction(), status: 'cancelled' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });

    it('should accept all valid status values', () => {
        const valid = ['active', 'returned', 'overdue', 'lost'];
        valid.forEach((status) => {
            const doc = new Transaction({ ...validTransaction(), status });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should default renewed to false', () => {
        const doc = new Transaction(validTransaction());
        expect(doc.renewed).toBe(false);
    });

    it('should default isDeleted to false', () => {
        const doc = new Transaction(validTransaction());
        expect(doc.isDeleted).toBe(false);
    });

    it('should default isLate to false', () => {
        const doc = new Transaction(validTransaction());
        expect(doc.isLate).toBe(false);
    });

    it('should set borrowDate to current date by default', () => {
        const doc = new Transaction(validTransaction());
        const now = new Date();
        // Allow 5 second variance
        expect(Math.abs(doc.borrowDate.getTime() - now.getTime())).toBeLessThan(5000);
    });
});
