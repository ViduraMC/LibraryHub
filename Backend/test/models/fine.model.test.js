import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

/**
 * Fine Model — Unit Tests
 * Tests schema validation for fines: required fields, enums, amount constraints.
 */
const fineSchema = new mongoose.Schema({
    bookTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookTransaction',
        required: [true, 'Book Transaction ID is required'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    daysOverdue: {
        type: Number,
        required: [true, 'Days overdue is required'],
        default: 0,
    },
    fineAmount: {
        type: Number,
        required: [true, 'Fine amount is required'],
        min: [0, 'Fine amount cannot be negative'],
    },
    fineStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'cancelled', 'refunded'],
        default: 'unpaid',
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required'],
    },
});

const Fine = mongoose.models.FineTest || mongoose.model('FineTest', fineSchema);

describe('Fine Model — Schema Validation', () => {

    const validFine = () => ({
        bookTransactionId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        bookId: new mongoose.Types.ObjectId(),
        daysOverdue: 5,
        fineAmount: 250,
    });

    it('should require bookTransactionId, userId, and bookId', () => {
        const doc = new Fine({ fineAmount: 100 });
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.bookTransactionId).toBeDefined();
        expect(err.errors.userId).toBeDefined();
        expect(err.errors.bookId).toBeDefined();
    });

    it('should pass validation with all required fields', () => {
        const doc = new Fine(validFine());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    it('should default fineStatus to "unpaid"', () => {
        const doc = new Fine(validFine());
        expect(doc.fineStatus).toBe('unpaid');
    });

    it('should reject invalid fineStatus enum', () => {
        const doc = new Fine({ ...validFine(), fineStatus: 'forgiven' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.fineStatus).toBeDefined();
    });

    it('should accept all valid fineStatus values', () => {
        const validStatuses = ['unpaid', 'paid', 'cancelled', 'refunded'];

        validStatuses.forEach((status) => {
            const doc = new Fine({ ...validFine(), fineStatus: status });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should reject negative fineAmount', () => {
        const doc = new Fine({ ...validFine(), fineAmount: -50 });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.fineAmount).toBeDefined();
    });

    it('should accept zero fineAmount', () => {
        const doc = new Fine({ ...validFine(), fineAmount: 0 });
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    it('should default daysOverdue to 0', () => {
        const data = validFine();
        delete data.daysOverdue;
        const doc = new Fine(data);
        expect(doc.daysOverdue).toBe(0);
    });
});
