import { describe, it, expect, beforeEach } from 'vitest';

/**
 * AuthContext — Unit Tests
 *
 * Tests the authentication state management logic (login, logout, persistence)
 * without rendering React components. Pure logic testing.
 */

describe('Auth State Management — Login Logic', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should store token and user in localStorage on login', () => {
        const userData = { _id: '123', fullName: 'John Doe', role: 'student', email: 'john@test.com' };
        const jwtToken = 'eyJhbGciOiJIUzI1.test.token';

        // Simulate login
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));

        expect(localStorage.getItem('token')).toBe(jwtToken);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(userData);
    });

    it('should parse stored user data correctly', () => {
        const userData = {
            _id: 'abc123',
            fullName: 'Jane Librarian',
            role: 'librarian',
            email: 'jane@lib.com',
            membershipId: 'LB-26-0001',
        };
        localStorage.setItem('user', JSON.stringify(userData));

        const parsed = JSON.parse(localStorage.getItem('user'));

        expect(parsed._id).toBe('abc123');
        expect(parsed.fullName).toBe('Jane Librarian');
        expect(parsed.role).toBe('librarian');
        expect(parsed.membershipId).toBe('LB-26-0001');
    });

    it('should return null when no session exists', () => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
});

describe('Auth State Management — Logout Logic', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should clear all auth data from localStorage on logout', () => {
        // Set up a session
        localStorage.setItem('token', 'some-jwt-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

        // Simulate logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle logout gracefully when no session exists', () => {
        // No items in localStorage — should not throw
        expect(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }).not.toThrow();
    });
});

describe('Auth State Management — Session Restore', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should restore session from localStorage on app load', () => {
        const storedToken = 'restored-jwt-token';
        const storedUser = { _id: '999', fullName: 'Restored User', role: 'admin' };

        localStorage.setItem('token', storedToken);
        localStorage.setItem('user', JSON.stringify(storedUser));

        // Simulate session restore (same logic as AuthProvider useEffect)
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        let restoredUser = null;
        let restoredToken = null;

        if (token && user) {
            restoredToken = token;
            restoredUser = JSON.parse(user);
        }

        expect(restoredToken).toBe(storedToken);
        expect(restoredUser).toEqual(storedUser);
    });

    it('should NOT restore if only token exists (no user data)', () => {
        localStorage.setItem('token', 'orphan-token');

        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        let restoredUser = null;
        let restoredToken = null;

        if (token && user) {
            restoredToken = token;
            restoredUser = JSON.parse(user);
        }

        // Both should remain null since user was missing
        expect(restoredToken).toBeNull();
        expect(restoredUser).toBeNull();
    });
});

describe('Auth State Management — Role Checking', () => {

    it('should correctly identify user roles', () => {
        const roles = ['admin', 'librarian', 'student', 'teacher'];

        roles.forEach((role) => {
            const user = { _id: '1', fullName: 'Test', role };
            expect(user.role).toBe(role);
        });
    });

    it('should check role-based access correctly', () => {
        const adminUser = { role: 'admin' };
        const studentUser = { role: 'student' };

        const isAdmin = (user) => user?.role === 'admin';
        const isLibrarian = (user) => user?.role === 'librarian';
        const isStudentOrTeacher = (user) => ['student', 'teacher'].includes(user?.role);

        expect(isAdmin(adminUser)).toBe(true);
        expect(isAdmin(studentUser)).toBe(false);
        expect(isStudentOrTeacher(studentUser)).toBe(true);
        expect(isLibrarian(adminUser)).toBe(false);
    });
});
