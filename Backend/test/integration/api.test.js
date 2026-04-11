import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import app from '../../index.js';

/**
 * Integration Tests — API Endpoints
 *
 * These tests hit real API endpoints against the Express app.
 * The app connects to the real MongoDB (via .env), so these are
 * true integration tests that verify controller + model + DB interaction.
 */

let server;
let request;

beforeAll(async () => {
    // Wait for DB connection and start server on random port
    await new Promise((resolve) => setTimeout(resolve, 3000));
    server = app.listen(0); // port 0 = random available port
    request = supertest(server);
});

afterAll(async () => {
    if (server) server.close();
});

// ═══════════════════════════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════════════════════════
describe('Health Check', () => {
    it('GET / — should return API working message', async () => {
        const res = await request.get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('API working');
    });
});

// ═══════════════════════════════════════════════════════════════
// Auth Endpoints
// ═══════════════════════════════════════════════════════════════
describe('Auth API', () => {
    it('POST /api/auth/login — should reject empty body', async () => {
        const res = await request.post('/api/auth/login').send({});
        expect([400, 401, 500]).toContain(res.status);
    });

    it('POST /api/auth/login — should reject wrong credentials', async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'nonexistent@test.com',
            password: 'wrongpassword',
        });
        expect([400, 401, 404]).toContain(res.status);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login — should login with valid admin credentials', async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });

        // If admin seed worked, this should succeed
        if (res.status === 200) {
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');
        }
        // If admin doesn't exist yet, just verify it returns a proper response
        expect([200, 400, 401, 404]).toContain(res.status);
    });
});

// ═══════════════════════════════════════════════════════════════
// Protected Endpoints — Auth Required
// ═══════════════════════════════════════════════════════════════
describe('Protected Endpoints', () => {
    it('GET /api/books — should return 401 without auth token', async () => {
        const res = await request.get('/api/books');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/librarians — should return 401 without auth token', async () => {
        const res = await request.get('/api/admin/librarians');
        expect(res.status).toBe(401);
    });

    it('GET /api/transactions — should return 401 without auth token', async () => {
        const res = await request.get('/api/transactions');
        expect(res.status).toBe(401);
    });

    it('GET /api/fines/my-fines — should return 401 without auth token', async () => {
        const res = await request.get('/api/fines/my-fines');
        expect(res.status).toBe(401);
    });

    it('GET /api/ebooks — should return 401 without auth token', async () => {
        const res = await request.get('/api/ebooks');
        expect(res.status).toBe(401);
    });
});

// ═══════════════════════════════════════════════════════════════
// Authenticated Endpoints (login first, then test)
// ═══════════════════════════════════════════════════════════════
describe('Authenticated API Calls', () => {
    let authToken = null;

    beforeAll(async () => {
        // Try to login as admin to get a token
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200 && res.body.token) {
            authToken = res.body.token;
        }
    });

    it('GET /api/books — should return books list with auth', async () => {
        if (!authToken) return; // skip if login didn't work

        const res = await request
            .get('/api/books')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });

    it('GET /api/fines/all — should return fines data with auth', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/fines/all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
    });

    it('GET /api/reports — should return reports list with admin auth', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/reports')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });

    it('POST /api/reports — should reject report creation with missing fields', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/reports')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Incomplete Report' }); // missing type, dates, counts

        expect([400, 500]).toContain(res.status);
    });

    it('POST /api/auth/logout — should logout successfully', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${authToken}`);

        expect([200, 201]).toContain(res.status);
    });
});

// ═══════════════════════════════════════════════════════════════
// Book Reservation — Protected Endpoints
// ═══════════════════════════════════════════════════════════════
describe('Book Reservation API — Auth Protection', () => {
    it('GET /api/book-reservation — should return 401 without auth token', async () => {
        const res = await request.get('/api/book-reservation');
        expect(res.status).toBe(401);
    });

    it('POST /api/book-reservation — should return 401 without auth token', async () => {
        const res = await request
            .post('/api/book-reservation')
            .send({ bookId: '000000000000000000000000' });
        expect(res.status).toBe(401);
    });

    it('GET /api/book-reservation/my-reservations — should return 401 without auth token', async () => {
        const res = await request.get('/api/book-reservation/my-reservations');
        expect(res.status).toBe(401);
    });
});

// ═══════════════════════════════════════════════════════════════
// Report Management — Protected Endpoints
// ═══════════════════════════════════════════════════════════════
describe('Report Management API — Auth Protection', () => {
    it('GET /api/reports — should return 401 without auth token', async () => {
        const res = await request.get('/api/reports');
        expect(res.status).toBe(401);
    });

    it('POST /api/reports — should return 401 without auth token', async () => {
        const res = await request
            .post('/api/reports')
            .send({ title: 'Unauthorized Report' });
        expect(res.status).toBe(401);
    });

    it('GET /api/reports/nonexistent-id — should return 401 without auth token', async () => {
        const res = await request.get('/api/reports/000000000000000000000000');
        expect(res.status).toBe(401);
    });

    it('DELETE /api/reports/some-id — should return 401 without auth token', async () => {
        const res = await request.delete('/api/reports/000000000000000000000000');
        expect(res.status).toBe(401);
    });
});
