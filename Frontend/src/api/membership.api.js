import axiosInstance from './axiosInstance.js';

// Get all membership requests — supports query params like { status: 'verified' }
export const getMembershipRequests = (params) =>
    axiosInstance.get('/membership-request', { params });

// Get a single membership request by ID
export const getMembershipRequest = (id) =>
    axiosInstance.get(`/membership-request/${id}`);

// Approve a verified membership request (librarian only)
export const approveRequest = (id) =>
    axiosInstance.put(`/membership-request/${id}/approve`);

// Reject a verified membership request (librarian only)
// reason is an optional string explaining the rejection
export const rejectRequest = (id, reason) =>
    axiosInstance.put(`/membership-request/${id}/reject`, { reason });
