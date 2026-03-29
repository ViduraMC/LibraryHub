import axiosInstance from './axiosInstance.js';

// Get all unpaid fines
export const getAllUnpaidFines = () =>
    axiosInstance.get('/fines/all-unpaid');

// Trigger calculation of fines (useful to sync manually)
export const calculateOverdueFines = () =>
    axiosInstance.post('/fines/calculate');

// Mark fine as paid
export const markFinePaid = (id) =>
    axiosInstance.patch(`/fines/${id}/pay`);

// Cancel a fine (Admin only, but included for completeness)
export const cancelFine = (id, reason) =>
    axiosInstance.patch(`/fines/${id}/cancel`, { cancellationReason: reason });
