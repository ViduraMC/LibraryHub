import axiosInstance from './axiosInstance.js';

// borrow a book (unified flow)
export const borrowBook = (data) => 
    axiosInstance.post('/transactions/borrow', data);

// return a book
export const returnBook = (id) => 
    axiosInstance.put(`/transactions/${id}/return`);

// get full return details (transaction + book + fine + overdue info)
export const getTransactionReturnDetails = (id) =>
    axiosInstance.get(`/transactions/${id}/return-details`);

// renew a book
export const renewBook = (id) => 
    axiosInstance.put(`/transactions/${id}/renew`);

// get current user's transactions
export const getMyTransactions = () => 
    axiosInstance.get('/transactions/my');

// get all transactions (for librarians/admins)
export const getAllTransactions = (params) => 
    axiosInstance.get('/transactions', { params });

// delete a transaction (soft delete)
export const softDeleteTransaction = (id) => 
    axiosInstance.delete(`/transactions/${id}`);

// get soft-deleted transactions (recycle bin)
export const getDeletedTransactions = () => 
    axiosInstance.get('/transactions/deleted');

// restore a soft-deleted transaction
export const restoreTransaction = (id) => 
    axiosInstance.put(`/transactions/${id}/restore`);

// permanently delete a transaction (admin only)
export const permanentDeleteTransaction = (id) => 
    axiosInstance.delete(`/transactions/${id}/permanent`);
