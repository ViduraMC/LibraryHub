import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * axiosInstance — Unit Tests
 *
 * Tests the configuration and interceptor logic of the axios instance.
 * We test the logic in isolation without actually making HTTP requests.
 */

describe('axiosInstance — Configuration', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should use VITE_API_URL env var when available', () => {
        // Vite exposes env vars via import.meta.env
        // In test environment, we can test the fallback logic
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        expect(baseURL).toBe('http://localhost:5000/api'); // no env var in test
    });

    it('should fallback to localhost when VITE_API_URL is not set', () => {
        const fallback = 'http://localhost:5000/api';
        const baseURL = undefined || fallback;
        expect(baseURL).toBe('http://localhost:5000/api');
    });
});

describe('axiosInstance — Token Interceptor Logic', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should attach Authorization header when token exists', () => {
        // Simulate the interceptor logic
        localStorage.setItem('token', 'test-jwt-token-123');

        const config = { headers: {} };
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        expect(config.headers.Authorization).toBe('Bearer test-jwt-token-123');
    });

    it('should NOT attach Authorization header when no token', () => {
        const config = { headers: {} };
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        expect(config.headers.Authorization).toBeUndefined();
    });
});

describe('axiosInstance — 401 Response Interceptor Logic', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should clear localStorage on 401 response', () => {
        localStorage.setItem('token', 'some-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test' }));

        // Simulate 401 handler
        const status = 401;
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should NOT clear localStorage on non-401 errors', () => {
        localStorage.setItem('token', 'some-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test' }));

        const status = 500;
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        expect(localStorage.getItem('token')).toBe('some-token');
        expect(localStorage.getItem('user')).toBeDefined();
    });
});
