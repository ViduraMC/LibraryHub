import axiosInstance from './axiosInstance.js';

// Login for all roles:
//   admin / librarian  → { email, password }
//   student / teacher  → { membershipId, password }
export const loginUser = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

// Set password for newly approved members via the 48-hour email link.
// Backend expects: { token, password }  (NOT newPassword)
export const setPassword = (token, password) =>
    axiosInstance.post('/auth/set-password', { token, password });

// Submit a membership application (public — student or teacher registration)
export const submitMembershipRequest = (data) =>
    axiosInstance.post('/membership-request/submit', data);
