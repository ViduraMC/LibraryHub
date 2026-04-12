import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

/**
 * Report Model — Unit Tests
 * Tests schema validation: required fields, type/status enums, numeric constraints,
 * boolean defaults, date fields, and ObjectId references.
 */
const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Report title is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['weekly', 'monthly', 'custom'],
        required: [true, 'Report type is required'],
    },
    periodStart: {
        type: Date,
        required: [true, 'Period start date is required'],
    },
    periodEnd: {
        type: Date,
        required: [true, 'Period end date is required'],
    },
    totalBooks: {
        type: Number,
        required: true,
        min: 0,
    },
    lostBooks: {
        type: Number,
        required: true,
        min: 0,
    },
    totalNewUsers: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
    isFinalized: {
        type: Boolean,
        default: false,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required'],
    },
    finalizedAt: {
        type: Date,
        default: null,
    },
    archivedAt: {
        type: Date,
        default: null,
    },
});

const Report = mongoose.models.ReportTest || mongoose.model('ReportTest', reportSchema);

describe('Report Model — Schema Validation', () => {

    const validReport = () => ({
        title: 'Weekly Library Report',
        type: 'weekly',
        periodStart: new Date('2026-04-01'),
        periodEnd: new Date('2026-04-07'),
        totalBooks: 250,
        lostBooks: 2,
        totalNewUsers: 15,
        generatedBy: new mongoose.Types.ObjectId(),
    });

    // ── Required Fields ──────────────────────────────────────────

    it('should require title, type, periodStart, periodEnd, totalBooks, lostBooks, totalNewUsers, generatedBy', () => {
        const doc = new Report({});
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.title).toBeDefined();
        expect(err.errors.type).toBeDefined();
        expect(err.errors.periodStart).toBeDefined();
        expect(err.errors.periodEnd).toBeDefined();
        expect(err.errors.totalBooks).toBeDefined();
        expect(err.errors.lostBooks).toBeDefined();
        expect(err.errors.totalNewUsers).toBeDefined();
        expect(err.errors.generatedBy).toBeDefined();
    });

    it('should pass validation with all required fields', () => {
        const doc = new Report(validReport());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    // ── Type Enum ────────────────────────────────────────────────

    it('should accept all valid report types', () => {
        const types = ['weekly', 'monthly', 'custom'];

        types.forEach((type) => {
            const doc = new Report({ ...validReport(), type });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should reject invalid report type "daily"', () => {
        const doc = new Report({ ...validReport(), type: 'daily' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.type).toBeDefined();
    });

    it('should reject invalid report type "annual"', () => {
        const doc = new Report({ ...validReport(), type: 'annual' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.type).toBeDefined();
    });

    // ── Status Enum ──────────────────────────────────────────────

    it('should default status to "active"', () => {
        const doc = new Report(validReport());
        expect(doc.status).toBe('active');
    });

    it('should accept "archived" status', () => {
        const doc = new Report({ ...validReport(), status: 'archived' });
        const err = doc.validateSync();
        expect(err).toBeUndefined();
        expect(doc.status).toBe('archived');
    });

    it('should reject invalid status "deleted"', () => {
        const doc = new Report({ ...validReport(), status: 'deleted' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });

    // ── Numeric Constraints ──────────────────────────────────────

    it('should reject negative totalBooks', () => {
        const doc = new Report({ ...validReport(), totalBooks: -5 });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.totalBooks).toBeDefined();
    });

    it('should reject negative lostBooks', () => {
        const doc = new Report({ ...validReport(), lostBooks: -1 });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.lostBooks).toBeDefined();
    });

    it('should reject negative totalNewUsers', () => {
        const doc = new Report({ ...validReport(), totalNewUsers: -10 });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.totalNewUsers).toBeDefined();
    });

    it('should accept zero values for numeric fields', () => {
        const doc = new Report({
            ...validReport(),
            totalBooks: 0,
            lostBooks: 0,
            totalNewUsers: 0,
        });
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    // ── Boolean Defaults ─────────────────────────────────────────

    it('should default isFinalized to false', () => {
        const doc = new Report(validReport());
        expect(doc.isFinalized).toBe(false);
    });

    it('should accept isFinalized as true', () => {
        const doc = new Report({ ...validReport(), isFinalized: true });
        expect(doc.isFinalized).toBe(true);
    });

    // ── Date Defaults ────────────────────────────────────────────

    it('should default finalizedAt to null', () => {
        const doc = new Report(validReport());
        expect(doc.finalizedAt).toBeNull();
    });

    it('should default archivedAt to null', () => {
        const doc = new Report(validReport());
        expect(doc.archivedAt).toBeNull();
    });

    it('should accept specific date values for period fields', () => {
        const start = new Date('2026-03-01');
        const end = new Date('2026-03-31');
        const doc = new Report({ ...validReport(), periodStart: start, periodEnd: end });

        expect(doc.periodStart).toEqual(start);
        expect(doc.periodEnd).toEqual(end);
    });

    // ── ObjectId Reference ───────────────────────────────────────

    it('should store generatedBy as ObjectId', () => {
        const adminId = new mongoose.Types.ObjectId();
        const doc = new Report({ ...validReport(), generatedBy: adminId });
        expect(doc.generatedBy).toEqual(adminId);
        expect(doc.generatedBy).toBeInstanceOf(mongoose.Types.ObjectId);
    });
});
