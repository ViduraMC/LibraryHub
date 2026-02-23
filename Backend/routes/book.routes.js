import express from 'express';
import * as bookCtrl from '../controllers/book.controller.js';
import { authenticate, requireLibrarian } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public (authenticated) routes
router.get('/', authenticate, bookCtrl.listBooks);
router.get('/:id', authenticate, bookCtrl.getBookById);

// Librarian-only routes
router.post('/', authenticate, requireLibrarian, bookCtrl.createBook);
router.put('/:id', authenticate, requireLibrarian, bookCtrl.updateBook);
router.delete('/:id', authenticate, requireLibrarian, bookCtrl.deleteBook);

// Upload PDF for pastpapers / e-books (expects middleware to set req.file)
router.post(
    '/:id/upload-pdf',
    authenticate,
    requireLibrarian,
    upload.single('pdf'),
    bookCtrl.uploadPdf
);

export default router; 