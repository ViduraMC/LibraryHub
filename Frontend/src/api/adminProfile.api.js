import axiosInstance from './axiosInstance.js';

// Get admin profile
export const getAdminProfile = () =>
    axiosInstance.get('/admin-profile/profile');

// Update admin profile (phone, address)
export const updateAdminProfile = (data) =>
    axiosInstance.patch('/admin-profile/profile', data);

// Update admin password
export const updateAdminPassword = (data) =>
    axiosInstance.patch('/admin-profile/profile/password', data);

// Get system-wide stats for admin dashboard
export const getSystemStats = () =>
    axiosInstance.get('/admin-profile/profile/system-stats');
