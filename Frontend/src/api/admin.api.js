import axiosInstance from './axiosInstance.js';

// POST /api/admin/librarian  (admin only)
// Creates a new librarian account; credentials are emailed automatically.
export const createLibrarian = (data) =>
    axiosInstance.post('/admin/librarian', data);

// GET /api/admin/librarians  (admin only)
export const getAllLibrarians = () =>
    axiosInstance.get('/admin/librarians');

// PUT /api/admin/librarian/:id  (admin only)
// Update librarian details (fullName, email, phone, address)
export const updateLibrarian = (id, data) =>
    axiosInstance.put(`/admin/librarian/${id}`, data);

// PATCH /api/admin/librarian/:id/status  (admin only)
// Toggles the librarian's isActive flag
export const toggleLibrarianStatus = (id) =>
    axiosInstance.patch(`/admin/librarian/${id}/status`);

// DELETE /api/admin/librarian/:id  (admin only)
export const deleteLibrarian = (id) =>
    axiosInstance.delete(`/admin/librarian/${id}`);

// GET /api/admin/user/search?membershipId=...  (admin + librarian)
// Looks up a user by their membershipId — used by BorrowBookPage
export const searchUserByMembershipId = (membershipId) =>
    axiosInstance.get('/admin/user/search', { params: { membershipId } });

// POST /api/school-list/students/upload  (admin only, multipart/form-data)
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

// PUT /api/school-list/:id  (admin only)
export const updateSchoolListEntry = (id, data) =>
    axiosInstance.put(`/school-list/${id}`, data);

// DELETE /api/school-list/:id  (admin only)
export const deleteSchoolListEntry = (id) =>
    axiosInstance.delete(`/school-list/${id}`);

// DELETE /api/school-list/clear/:type  (admin only)
// Wipes all entries of the given type (student or teacher)
export const clearSchoolList = (type) =>
    axiosInstance.delete(`/school-list/clear/${type}`);
