import axiosInstance from './axiosInstance.js';

// POST /api/auth/login
// Both admin/librarian (email + password) and student/teacher (membershipId + password)
export const loginUser = (data) =>
    axiosInstance.post('/auth/login', data);

// POST /api/auth/set-password
// Called when a new member clicks the approval email link.
// Body: { token, password }
export const setPassword = (token, password) =>
    axiosInstance.post('/auth/set-password', { token, password });

// POST /api/auth/logout (auth required)
// Blacklists the current JWT token server-side so it can't be reused.
export const logoutUser = () =>
    axiosInstance.post('/auth/logout');

// POST /api/membership-request/submit (public — no auth)
// Student/teacher applies for library membership.
export const submitMembershipRequest = (data) =>
    axiosInstance.post('/membership-request/submit', data);
