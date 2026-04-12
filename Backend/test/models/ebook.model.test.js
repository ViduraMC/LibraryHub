import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

/**
 * Ebook Model — Unit Tests
 * Tests schema validation for ebooks: required fields, category enum, defaults.
 */
const ebookSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
        type: String,
        required: true,
        enum: ['Textbook', 'Reference', 'Novel', 'Pastpaper', 'Guide', 'Other'],
        default: 'Other',
    },
    grade: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    filePath: { type: String, required: [true, 'PDF file path is required'] },
    fileSize: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Ebook = mongoose.models.EbookTest || mongoose.model('EbookTest', ebookSchema);

describe('Ebook Model — Schema Validation', () => {

    const validEbook = () => ({
        title: 'Advanced Mathematics',
        author: 'Dr. Smith',
        filePath: '/uploads/math.pdf',
        uploadedBy: new mongoose.Types.ObjectId(),
        category: 'Textbook',
    });

    it('should require title, author, filePath, and uploadedBy', () => {
        const doc = new Ebook({});
        const err = doc.validateSync();

        expect(err).toBeDefined();
        expect(err.errors.title).toBeDefined();
        expect(err.errors.author).toBeDefined();
        expect(err.errors.filePath).toBeDefined();
        expect(err.errors.uploadedBy).toBeDefined();
    });

    it('should pass validation with all required fields', () => {
        const doc = new Ebook(validEbook());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
    });

    it('should reject invalid category enum', () => {
        const doc = new Ebook({ ...validEbook(), category: 'Comic' });
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.category).toBeDefined();
    });

    it('should accept all valid category values', () => {
        const categories = ['Textbook', 'Reference', 'Novel', 'Pastpaper', 'Guide', 'Other'];
        categories.forEach((cat) => {
            const doc = new Ebook({ ...validEbook(), category: cat });
            const err = doc.validateSync();
            expect(err).toBeUndefined();
        });
    });

    it('should default viewCount and downloadCount to 0', () => {
        const doc = new Ebook(validEbook());
        expect(doc.viewCount).toBe(0);
        expect(doc.downloadCount).toBe(0);
    });

    it('should default isActive to true', () => {
        const doc = new Ebook(validEbook());
        expect(doc.isActive).toBe(true);
    });

    it('should default description and grade to empty string', () => {
        const doc = new Ebook(validEbook());
        expect(doc.description).toBe('');
        expect(doc.grade).toBe('');
    });

    it('should store tags as array', () => {
        const doc = new Ebook({ ...validEbook(), tags: ['math', 'grade10'] });
        expect(doc.tags).toHaveLength(2);
        expect(doc.tags[0]).toBe('math');
    });
});
