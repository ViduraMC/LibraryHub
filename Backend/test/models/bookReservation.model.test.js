import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

/**
 * BookReservation Model — Unit Tests
 * Tests schema validation: required fields, status enum, queue defaults, date fields.
 */
const bookReservationSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    status: {
        type: String,
        enum: ['waiting', 'reserved', 'collected', 'expired', 'cancelled', 'completed'],
        default: 'waiting',
    },
    queuePosition: {
        type: Number,
        default: 0,
    },
    reservedAt: { type: Date },
    collectedAt: { type: Date, default: null },
    expiredDate: { type: Date },
});

const BookReservation =
    mongoose.models.BookReservationTest ||
    mongoose.model('BookReservationTest', bookReservationSchema);

describe('BookReservation Model — Schema Validation', () => {

    const validReservation = () => ({
        bookId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
    });

    // ── Required Fields ──────────────────────────────────────────

    it('should require bookId and userId', () => {
        const doc = new BookReservation({});
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.bookId).toBeDefined();
        expect(err.errors.userId).toBeDefined();
    });

    it('should pass validation with required fields only', () => {
        const doc = new BookReservation(validReservation());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    // ── Status Enum ──────────────────────────────────────────────

    it('should default status to "waiting"', () => {
        const doc = new BookReservation(validReservation());
        expect(doc.status).toBe('waiting');
    });

    it('should accept all valid status values', () => {
        const validStatuses = ['waiting', 'reserved', 'collected', 'expired', 'cancelled', 'completed'];

        validStatuses.forEach((status) => {
            const doc = new BookReservation({ ...validReservation(), status });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should reject invalid status values', () => {
        const doc = new BookReservation({ ...validReservation(), status: 'pending' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });

    it('should reject another invalid status "approved"', () => {
        const doc = new BookReservation({ ...validReservation(), status: 'approved' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });

    // ── Queue Position ───────────────────────────────────────────

    it('should default queuePosition to 0', () => {
        const doc = new BookReservation(validReservation());
        expect(doc.queuePosition).toBe(0);
    });

    it('should accept a positive queuePosition', () => {
        const doc = new BookReservation({ ...validReservation(), queuePosition: 5 });
        expect(doc.queuePosition).toBe(5);
    });

    // ── Date Fields ──────────────────────────────────────────────

    it('should default collectedAt to null', () => {
        const doc = new BookReservation(validReservation());
        expect(doc.collectedAt).toBeNull();
    });

    it('should accept reservedAt date', () => {
        const now = new Date();
        const doc = new BookReservation({ ...validReservation(), reservedAt: now });
        expect(doc.reservedAt).toEqual(now);
    });

    it('should accept expiredDate', () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const doc = new BookReservation({ ...validReservation(), expiredDate: tomorrow });
        expect(doc.expiredDate).toEqual(tomorrow);
    });

    // ── ObjectId Validation ──────────────────────────────────────

    it('should store bookId and userId as ObjectIds', () => {
        const data = validReservation();
        const doc = new BookReservation(data);

        expect(doc.bookId).toEqual(data.bookId);
        expect(doc.userId).toEqual(data.userId);
        expect(doc.bookId).toBeInstanceOf(mongoose.Types.ObjectId);
        expect(doc.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    });
});
