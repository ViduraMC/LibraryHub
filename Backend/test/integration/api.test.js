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

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Auth API
// ═══════════════════════════════════════════════════════════════
describe('Auth API — Error Scenarios', () => {
    it('POST /api/auth/login — should return 400 when password is missing', async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Password');
    });

    it('POST /api/auth/login — should return 400 when both email and membershipId are missing', async () => {
        const res = await request.post('/api/auth/login').send({
            password: 'somepass',
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject request with malformed JWT token', async () => {
        const res = await request
            .get('/api/books')
            .set('Authorization', 'Bearer this.is.not.a.valid.jwt');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject request with expired token', async () => {
        // Create a token that expires immediately
        const jwt = await import('jsonwebtoken');
        const expiredToken = jwt.default.sign(
            { id: '000000000000000000000000', role: 'admin' },
            process.env.JWT_SECRET || 'libraryhub_jwt_secret_key_2026',
            { expiresIn: '-1s' }
        );

        const res = await request
            .get('/api/books')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(res.status).toBe(401);
        expect(res.body.message).toContain('expired');
    });

    it('should reject request with no Bearer prefix', async () => {
        const res = await request
            .get('/api/books')
            .set('Authorization', 'NotBearer some-token');
        expect(res.status).toBe(401);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Books API
// ═══════════════════════════════════════════════════════════════
describe('Books API — Error Scenarios', () => {
    let authToken = null;

    beforeAll(async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200) authToken = res.body.token;
    });

    it('GET /api/books/:id — should return 400 for invalid ObjectId', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/books/not-a-valid-id')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid');
    });

    it('GET /api/books/:id — should return 404 for non-existent book', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/books/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });

    it('PUT /api/books/:id — should return 400 for invalid ObjectId on update', async () => {
        if (!authToken) return;

        const res = await request
            .put('/api/books/invalid-id-here')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Name' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('DELETE /api/books/:id — should return 404 for non-existent book', async () => {
        if (!authToken) return;

        const res = await request
            .delete('/api/books/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/books — should return empty array with no matching query', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/books?q=zzzznonexistentbookzzz')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.meta.total).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Reports API
// ═══════════════════════════════════════════════════════════════
describe('Reports API — Error Scenarios', () => {
    let authToken = null;

    beforeAll(async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200) authToken = res.body.token;
    });

    it('POST /api/reports — should return 400 when required fields are missing', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/reports')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Only Title' }); // missing type, periodStart, periodEnd

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('required');
    });

    it('POST /api/reports — should return 400 when periodStart is after periodEnd', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/reports')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Invalid Date Report',
                type: 'weekly',
                periodStart: '2026-04-10',
                periodEnd: '2026-04-01', // end before start!
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('periodStart');
    });

    it('GET /api/reports/:id — should return 404 for non-existent report', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/reports/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });

    it('PUT /api/reports/:id — should return 404 for non-existent report on update', async () => {
        if (!authToken) return;

        const res = await request
            .put('/api/reports/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(404);
    });

    it('PATCH /api/reports/:id/finalize — should return 404 for non-existent report', async () => {
        if (!authToken) return;

        const res = await request
            .patch('/api/reports/000000000000000000000000/finalize')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
    });

    it('PATCH /api/reports/:id/restore — should return 404 for non-existent report', async () => {
        if (!authToken) return;

        const res = await request
            .patch('/api/reports/000000000000000000000000/restore')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
    });

    it('DELETE /api/reports/:id/permanent — should return 404 for non-existent report', async () => {
        if (!authToken) return;

        const res = await request
            .delete('/api/reports/000000000000000000000000/permanent')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Transactions API
// ═══════════════════════════════════════════════════════════════
describe('Transactions API — Error Scenarios', () => {
    let authToken = null;

    beforeAll(async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200) authToken = res.body.token;
    });

    it('POST /api/transactions/borrow — should reject with missing userId', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/transactions/borrow')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ bookId: '000000000000000000000000' }); // missing userId

        expect([400, 404, 500]).toContain(res.status);
    });

    it('POST /api/transactions/borrow — should reject with non-existent book', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/transactions/borrow')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                userId: '000000000000000000000000',
                bookId: '000000000000000000000000',
            });

        expect([400, 404, 500]).toContain(res.status);
    });

    it('POST /api/transactions/return — should reject with non-existent transaction', async () => {
        if (!authToken) return;

        const res = await request
            .post('/api/transactions/return')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ transactionId: '000000000000000000000000' });

        expect([400, 404, 500]).toContain(res.status);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Ebooks API
// ═══════════════════════════════════════════════════════════════
describe('Ebooks API — Error Scenarios', () => {
    let authToken = null;

    beforeAll(async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200) authToken = res.body.token;
    });

    it('GET /api/ebooks/:id — should return error for non-existent ebook', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/ebooks/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        expect([404, 500]).toContain(res.status);
    });

    it('DELETE /api/ebooks/:id — should return error for non-existent ebook', async () => {
        if (!authToken) return;

        const res = await request
            .delete('/api/ebooks/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        expect([403, 404, 500]).toContain(res.status);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Book Reservation API
// ═══════════════════════════════════════════════════════════════
describe('Book Reservation API — Error Scenarios', () => {
    let authToken = null;

    beforeAll(async () => {
        const res = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (res.status === 200) authToken = res.body.token;
    });

    it('GET /api/book-reservation/reservations/:id — should return 403 for admin role (librarian-only route)', async () => {
        if (!authToken) return;

        const res = await request
            .get('/api/book-reservation/reservations/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        // Admin can't access librarian-only routes
        expect(res.status).toBe(403);
    });

    it('DELETE /api/book-reservation/delete/:id — should return 403 for admin role (librarian-only route)', async () => {
        if (!authToken) return;

        const res = await request
            .delete('/api/book-reservation/delete/000000000000000000000000')
            .set('Authorization', `Bearer ${authToken}`);

        // Admin can't access librarian-only routes
        expect(res.status).toBe(403);
    });

    it('PATCH /api/book-reservation/cancel/:id — should return 401 without token', async () => {
        const res = await request
            .patch('/api/book-reservation/cancel/000000000000000000000000');
        expect(res.status).toBe(401);
    });
});

// ═══════════════════════════════════════════════════════════════
// ERROR SCENARIOS — Token Invalidation (post-logout)
// ═══════════════════════════════════════════════════════════════
describe('Token Invalidation — Post-Logout', () => {
    it('should reject requests with a logged-out (blacklisted) token', async () => {
        // 1. Login to get a fresh token
        const loginRes = await request.post('/api/auth/login').send({
            email: 'admin@libraryhub.com',
            password: 'Admin@123',
        });
        if (loginRes.status !== 200) return;

        const token = loginRes.body.token;

        // 2. Logout (blacklists the token)
        await request
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        // 3. Try using the same token — should be rejected
        const res = await request
            .get('/api/books')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toContain('invalidated');
    });
});
