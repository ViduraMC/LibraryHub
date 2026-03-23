import axiosInstance from './axiosInstance.js';

// login — works for all roles
// admin/librarian: { email, password }
// student/teacher: { membershipId, password }
export const loginUser = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

// set password — for newly approved students/teachers from email link
export const setPassword = (token, newPassword) =>
    axiosInstance.post('/auth/set-password', { token, newPassword });

// logout — invalidates token on server
export const logoutUser = () =>
    axiosInstance.post('/auth/logout');
