import axiosInstance from './axiosInstance.js';

// login for all roles
// admin/librarian: email + password
// student/teacher: membershipId + password
export const loginUser = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

// set password for newly approved members via link token
export const setPassword = (token, newPassword) =>
    axiosInstance.post('/auth/set-password', { token, newPassword });

// invalidate token on server side logout
export const logoutUser = () =>
    axiosInstance.post('/auth/logout');
