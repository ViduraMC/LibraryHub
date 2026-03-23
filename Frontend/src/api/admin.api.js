import axiosInstance from './axiosInstance.js';

// POST /api/admin/librarian  (admin only)
// Creates a new librarian account; credentials are emailed automatically.
// Body: { fullName, email, phone?, address? }
export const createLibrarian = (data) =>
    axiosInstance.post('/admin/librarian', data);

// GET /api/admin/librarians  (admin only)
export const getAllLibrarians = () =>
    axiosInstance.get('/admin/librarians');

// POST /api/school-list/students/upload  (admin only, multipart/form-data)
// Field name must be "file" to match the multer config.
export const uploadStudentList = (formData) =>
    axiosInstance.post('/school-list/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// POST /api/school-list/teachers/upload  (admin only, multipart/form-data)
export const uploadTeacherList = (formData) =>
    axiosInstance.post('/school-list/teachers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// GET /api/school-list/students  (admin/librarian)
export const getStudentList = () =>
    axiosInstance.get('/school-list/students');

// GET /api/school-list/teachers  (admin/librarian)
export const getTeacherList = () =>
    axiosInstance.get('/school-list/teachers');
