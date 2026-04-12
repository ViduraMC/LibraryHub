import axiosInstance from './axiosInstance.js';

// Get all unpaid fines
export const getAllUnpaidFines = () =>
    axiosInstance.get('/fines/all-unpaid');

// Get all fines with optional status filter (?status=paid, cancelled, etc.)
export const getAllFines = (params) =>
    axiosInstance.get('/fines/all', { params });

// Trigger calculation of fines (sync overdue transactions)
export const calculateOverdueFines = () =>
    axiosInstance.post('/fines/calculate');

// Mark fine as paid
export const markFinePaid = (id) =>
    axiosInstance.patch(`/fines/${id}/pay`);

// Cancel a fine with reason
export const cancelFine = (id, reason) =>
    axiosInstance.patch(`/fines/${id}/cancel`, { cancellationReason: reason });

// Update a fine's amount or overdue days
export const updateFine = (id, data) =>
    axiosInstance.put(`/fines/${id}`, data);

// Permanently delete a fine (admin only)
export const deleteFine = (id) =>
    axiosInstance.delete(`/fines/${id}`, { data: { confirmDelete: true } });
