import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

/**
 * Book Model — Unit Tests
 * Tests schema validation rules without needing a live DB.
 * Uses mongoose's validateSync() which works entirely in-memory.
 */

// Inline schema recreation to avoid triggering DB connection from model imports
const BookSchema = new mongoose.Schema({
    bookId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    type: {
        type: String,
        required: true,
        enum: ['Textbook', 'Reference', 'Novel', 'Magazine', 'Pastpaper', 'Fictional', 'Other'],
        default: 'Textbook',
    },
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    available: { type: Boolean, default: true },
    value: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true }],
});

// Avoid OverwriteModelError if vitest re-runs
const Book = mongoose.models.BookTest || mongoose.model('BookTest', BookSchema);

describe('Book Model — Schema Validation', () => {

    it('should require bookId, name, author, grade', () => {
        const doc = new Book({});
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.bookId).toBeDefined();
        expect(err.errors.name).toBeDefined();
        expect(err.errors.author).toBeDefined();
        expect(err.errors.grade).toBeDefined();
    });

    it('should pass validation with all required fields', () => {
        const doc = new Book({
            bookId: 'BK001',
            name: 'Test Book',
            author: 'Test Author',
            grade: 'Grade 10',
            type: 'Textbook',
        });
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    it('should reject invalid book type enum', () => {
        const doc = new Book({
            bookId: 'BK002',
            name: 'Test',
            author: 'Author',
            grade: 'Grade 5',
            type: 'InvalidType',
        });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.type).toBeDefined();
    });

    it('should accept all valid book type enums', () => {
        const validTypes = ['Textbook', 'Reference', 'Novel', 'Magazine', 'Pastpaper', 'Fictional', 'Other'];

        validTypes.forEach((type) => {
            const doc = new Book({
                bookId: `BK-${type}`,
                name: 'Test',
                author: 'Author',
                grade: 'Grade 5',
                type,
            });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should default totalCopies and availableCopies to 1', () => {
        const doc = new Book({
            bookId: 'BK003',
            name: 'Test',
            author: 'Author',
            grade: 'Grade 5',
        });
        expect(doc.totalCopies).toBe(1);
        expect(doc.availableCopies).toBe(1);
    });

    it('should default available to true', () => {
        const doc = new Book({
            bookId: 'BK004',
            name: 'Test',
            author: 'Author',
            grade: 'Grade 5',
        });
        expect(doc.available).toBe(true);
    });

    it('should reject negative value', () => {
        const doc = new Book({
            bookId: 'BK005',
            name: 'Test',
            author: 'Author',
            grade: 'Grade 5',
            value: -100,
        });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.value).toBeDefined();
    });

    it('should store tags as array of strings', () => {
        const doc = new Book({
            bookId: 'BK006',
            name: 'Test',
            author: 'Author',
            grade: 'Grade 5',
            tags: ['science', 'physics'],
        });
        expect(doc.tags).toHaveLength(2);
        expect(doc.tags).toContain('science');
    });
});
