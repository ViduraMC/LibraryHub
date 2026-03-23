import axiosInstance from './axiosInstance.js';

// Create a new librarian account (admin only)
export const createLibrarian = (data) =>
    axiosInstance.post('/admin/librarian', data);

// Get all librarian accounts (admin only)
export const getAllLibrarians = () =>
    axiosInstance.get('/admin/librarians');

// Upload student school list via CSV file (admin only)
// data is a FormData object with a 'file' field
export const uploadStudentList = (formData) =>
    axiosInstance.post('/school-list/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Upload teacher school list via CSV file (admin only)
export const uploadTeacherList = (formData) =>
    axiosInstance.post('/school-list/teachers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Get uploaded student school list (admin / librarian)
export const getStudentList = () =>
    axiosInstance.get('/school-list/students');

// Get uploaded teacher school list (admin / librarian)
export const getTeacherList = () =>
    axiosInstance.get('/school-list/teachers');
