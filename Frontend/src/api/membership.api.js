import axiosInstance from './axiosInstance.js';

// GET /api/membership-request?status=verified  (librarian/admin)
// Returns all membership requests, optionally filtered by status.
export const getMembershipRequests = (params) =>
    axiosInstance.get('/membership-request', { params });

// GET /api/membership-request/:id  (librarian/admin)
export const getMembershipRequest = (id) =>
    axiosInstance.get(`/membership-request/${id}`);

// PUT /api/membership-request/:id/approve  (librarian only)
// Generates a membershipId and sends a set-password email.
export const approveRequest = (id) =>
    axiosInstance.put(`/membership-request/${id}/approve`);

// PUT /api/membership-request/:id/reject  (librarian only)
// Body: { reason }
export const rejectRequest = (id, reason) =>
    axiosInstance.put(`/membership-request/${id}/reject`, { reason });

// PUT /api/membership-request/:id  (librarian only)
// Update membership request details
export const updateMembershipRequest = (id, data) =>
    axiosInstance.put(`/membership-request/${id}`, data);

// DELETE /api/membership-request/:id  (librarian only)
export const deleteMembershipRequest = (id) =>
    axiosInstance.delete(`/membership-request/${id}`);
