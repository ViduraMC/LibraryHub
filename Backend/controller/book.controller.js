import Book from '../models/book.model.js';
import mongoose from 'mongoose';


export const createBook = async (req, res, next) => {
    try{
        const payload = {...req.body};

        payload.librarian = req.user?.id;

        if (!payload.bookId) payload.bookId = `B-${Date.now()}`;

        if (typeof payload.availableCopies === 'undefined') payload.availableCopies = payload.totalCopies ?? 1;

        const book = await Book.create(payload);
        return res.status(201).json({ success: true, data: book});
    } catch (err){
        next(err);
    }
};

export const listBooks = async (req, res, next) => {
    try{
        const { grade, type, q, tags, available, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc'} = req.query;
        const filter = {};

        if (grade) filter.grade = grade;
        if (type) filter.type = type;
        if (typeof available !== 'undefined') filter.available = available === 'true' || available === '1';
        if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())};
        if (q) filter.$text = { $search: q };

        const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
        const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            Book.find(filter).sort(sort).skip(skip).limit(Number(limit)),
            Book.countDocuments(filter)
        ]);

        return res.json({
            success: true,
            meta: { total, page: Number(page), limit: Number(limit)},
            data
        });

    } catch (err){
        next(err);
    }
};

export const getBookById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id'});

        const book = await Book.findById(id).populate('librarian', 'name email');
        if (!book)  return res.status(404).json({ success: false, message: 'Book not found'});

        return res.json({ success: true, data: book});
    } catch (err){
        next(err);
    }

};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const existing = await Book.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Book not found' });

    // permission: require librarian role or the librarian who created the book
    if (req.user?.role !== 'librarian' && String(existing.librarian) !== String(req.user?.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // prevent changing librarian field unless by authorized flow
    if (req.body.librarian && String(req.body.librarian) !== String(existing.librarian)) {
      delete req.body.librarian;
    }

    const updated = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        if(!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id'});

        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found'});


        if (req.user?.role !== 'librarian' && String(book.librarian) !== String(req.user?.id)){
            return res.status(403).json({ success: true, message: 'Forbidden'});

        }

        await Book.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Book deleted'});

    } catch (err) {
        next(err);
    }
};

export const uploadPdf = async (req, res, next) => {
    try{
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id'});

        const fileUrl =  req.file?.location || (req.file ? `/uploads/${req.file.filename}` : null);
        if (!fileUrl) return res.status(400).json({ success: false, message: 'No file uploaded'});

        const book = await Book.findByIdAndUpdate(id, { pdf: fileUrl}, { new: true, runValidators: true});
        if (!book) return res.status(404).json({ success: false, message: 'Book not found'});

        return res.json({ success: true, data: book});
    } catch (err){
        next(err);
    }
};

export default {
    createBook,
    listBooks,
    getBookById,
    updateBook,
    deleteBook,
    uploadPdf
};

