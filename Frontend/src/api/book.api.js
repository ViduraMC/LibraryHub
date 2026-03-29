import axiosInstance from './axiosInstance.js';

// Get all books with optional filters (q, grade, type)
export const getBooks = (params) =>
    axiosInstance.get('/books', { params });

// Get a single book by ID
export const getBook = (id) =>
    axiosInstance.get(`/books/${id}`);

// Create a new book (librarian/admin only)
export const createBook = (data) =>
    axiosInstance.post('/books', data);

// Update an existing book (librarian/admin only)
export const updateBook = (id, data) =>
    axiosInstance.put(`/books/${id}`, data);

// Delete a book (librarian/admin only)
export const deleteBook = (id) =>
    axiosInstance.delete(`/books/${id}`);