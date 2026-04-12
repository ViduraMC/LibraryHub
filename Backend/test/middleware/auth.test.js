import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';

/**
 * Auth Middleware — Unit Tests
 * Tests JWT verification logic in isolation using mocks.
 * Does NOT connect to DB — pure logic testing.
 */

describe('Auth Middleware — JWT Verification Logic', () => {
    const JWT_SECRET = 'test_secret_key';

    it('should generate a valid JWT token', () => {
        const payload = { id: '12345', role: 'student' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should decode a valid token correctly', () => {
        const payload = { id: 'user123', role: 'librarian' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        const decoded = jwt.verify(token, JWT_SECRET);

        expect(decoded.id).toBe('user123');
        expect(decoded.role).toBe('librarian');
        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();
    });

    it('should throw JsonWebTokenError for invalid token', () => {
        expect(() => {
            jwt.verify('invalid.token.here', JWT_SECRET);
        }).toThrow();

        try {
            jwt.verify('invalid.token.here', JWT_SECRET);
        } catch (err) {
            expect(err.name).toBe('JsonWebTokenError');
        }
    });

    it('should throw JsonWebTokenError for wrong secret', () => {
        const token = jwt.sign({ id: '123' }, JWT_SECRET);

        try {
            jwt.verify(token, 'wrong_secret');
        } catch (err) {
            expect(err.name).toBe('JsonWebTokenError');
        }
    });

    it('should throw TokenExpiredError for expired token', () => {
        // Create a token that expired 1 second ago
        const token = jwt.sign({ id: '123' }, JWT_SECRET, { expiresIn: '-1s' });

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (err) {
            expect(err.name).toBe('TokenExpiredError');
        }
    });

    it('should extract Bearer token from authorization header', () => {
        const authHeader = 'Bearer eyJhbGciOiJIUzI1.payload.signature';
        const extractToken = (header) => {
            if (!header || !header.startsWith('Bearer ')) return null;
            return header.split(' ')[1];
        };

        expect(extractToken(authHeader)).toBe('eyJhbGciOiJIUzI1.payload.signature');
        expect(extractToken(null)).toBeNull();
        expect(extractToken('')).toBeNull();
        expect(extractToken('NoBearer token')).toBeNull();
    });

    it('should reject request without Authorization header', () => {
        const extractToken = (header) => {
            if (!header || !header.startsWith('Bearer ')) return null;
            return header.split(' ')[1];
        };

        // Simulate: no header
        expect(extractToken(undefined)).toBeNull();
        // Simulate: empty header
        expect(extractToken('')).toBeNull();
        // Simulate: malformed header (no Bearer prefix)
        expect(extractToken('Basic some-token')).toBeNull();
    });
});
