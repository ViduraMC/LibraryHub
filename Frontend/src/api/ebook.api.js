import axiosInstance from './axiosInstance.js';

// List e-books with optional filters
export const listEbooks = (params = {}) =>
    axiosInstance.get('/ebooks', { params });

// Get single e-book by ID (increments view count)
export const getEbookById = (id) =>
    axiosInstance.get(`/ebooks/${id}`);

// Upload a new e-book (multipart form data)
export const uploadEbook = (formData) =>
    axiosInstance.post('/ebooks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Update e-book metadata
export const updateEbook = (id, data) =>
    axiosInstance.put(`/ebooks/${id}`, data);

// Delete e-book
export const deleteEbook = (id) =>
    axiosInstance.delete(`/ebooks/${id}`);

// Download e-book PDF (returns blob)
export const downloadEbook = (id) =>
    axiosInstance.get(`/ebooks/${id}/download`, {
        responseType: 'blob',
    });
