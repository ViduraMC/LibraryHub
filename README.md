# 📚 LibraryHub — School Library Management System

> A comprehensive full-stack library management system built with the **MERN stack** (MongoDB, Express.js, React, Node.js) for managing books, transactions, reservations, fines, e-books, and reports in a school library environment.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Deployment Report](#-deployment-report)
- [Testing Instruction Report](#-testing-instruction-report)
- [Team Contributions](#-team-contributions)

---

## ✨ Features

| Module | Description |
|---|---|
| **Authentication** | JWT-based login/logout with role-based access (Admin, Librarian, Student, Teacher) |
| **Book Management** | CRUD operations for physical books with search, filtering, and pagination |
| **Book Transactions** | Borrow, return, renew books with automated overdue detection |
| **Book Reservations** | Waiting queue system with auto-expiry (24h collection window) |
| **Fine Management** | Auto-calculated overdue fines with pay/cancel/refund workflows |
| **E-Book Management** | PDF upload, download, view/download count tracking |
| **Report Management** | Generate weekly/monthly/custom reports with CSV export |
| **User Profiles** | Student, Teacher, Librarian, and Admin profile management |
| **Dark Mode** | Full dark mode support across all pages |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT), bcrypt |
| **Testing** | Vitest, Supertest, Artillery |
| **Deployment** | Render (Backend), Vercel (Frontend) |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                    Deployed on: Vercel                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Books   │  │  Trans.  │  │  Admin   │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴──────────────┴──────────────┘        │
│                         │ Axios + JWT                       │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                    Deployed on: Render                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware: CORS → JSON Parser → JWT Auth → RoleAuth│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Auth │ │Books │ │Trans │ │Fines │ │Rsv.  │ │Report│   │
│  │Routes│ │Routes│ │Routes│ │Routes│ │Routes│ │Routes│   │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘   │
│     └────────┴────────┴────────┴────────┴────────┘         │
│                         │ Mongoose                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                 │
│                                                             │
│   Collections: users, books, booktransactions,              │
│   bookreservations, fines, ebooks, reports,                 │
│   blacklistedtokens, membershiprequests                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v20+ (via [nvm](https://github.com/nvm-sh/nvm))
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/ViduraMC/LibraryHub.git
cd LibraryHub
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env
# Edit .env with your values

# Start the development server
npm run dev
```

The backend will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. Default Admin Credentials

The system auto-seeds an admin account on first startup:

| Field | Value |
|---|---|
| Email | `admin@libraryhub.com` |
| Password | `Admin@123` |

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/libraryhub` |
| `JWT_SECRET` | Secret key for JWT signing | `libraryhub_jwt_secret_key_2026` |
| `EMAIL_USER` | Gmail for sending emails | `libraryhub@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `FRONTEND_URL` | Frontend URL (for email links) | `http://localhost:5173` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173,https://libraryhub.vercel.app` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend (`Frontend/.env.production`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://libraryhub-api.onrender.com/api` |

---

## 📡 API Endpoint Documentation

> Base URL: `http://localhost:5000/api`  
> All protected routes require `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/login` | ❌ | — | Login with email/membershipId + password |
| `POST` | `/set-password` | ❌ | — | Set password via token (first-time setup) |
| `POST` | `/logout` | ✅ | Any | Logout and blacklist the JWT token |

**Login Request:**
```json
POST /api/auth/login
{
    "email": "admin@libraryhub.com",
    "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "_id": "...",
        "fullName": "System Admin",
        "role": "admin",
        "email": "admin@libraryhub.com"
    }
}
```

**Error Response (401):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

| Screenshot | Description |
|---|---|
| ![Login Success](docs/screenshots/auth/200-%20login%20success.png) | Successful login — 200 |
| ![Login Failure](docs/screenshots/auth/401%20-%20invalid%20login.png) | Invalid credentials — 401 |
| ![Logout Success](docs/screenshots/auth/200-%20logout%20success.png) | Successful logout — 200 |

---

### Books — `/api/books`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | ✅ | Any | List books (with search, filter, pagination) |
| `GET` | `/:id` | ✅ | Any | Get single book by ID |
| `POST` | `/` | ✅ | Librarian, Admin | Create a new book |
| `PUT` | `/:id` | ✅ | Librarian, Admin | Update book details |
| `DELETE` | `/:id` | ✅ | Librarian, Admin | Delete a book |
| `POST` | `/:id/upload-pdf` | ✅ | Librarian, Admin | Upload PDF for a book |

**Query Parameters for `GET /api/books`:**

| Param | Description | Example |
|---|---|---|
| `q` | Search by bookId, name, or author | `?q=physics` |
| `grade` | Filter by grade | `?grade=Grade 10` |
| `type` | Filter by book type | `?type=Textbook` |
| `available` | Filter by availability | `?available=true` |
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (default: 20) | `?limit=10` |

| Screenshot | Description |
|---|---|
| ![Create Book](docs/screenshots/books/201%20-%20create%20book%20success.png) | Book created — 201 |
| ![Get Book](docs/screenshots/books/200-%20get%20book%20by%20id.png) | Get book by ID — 200 |
| ![Unauthorized](docs/screenshots/books/401-%20unauthorized%20login.png) | Missing auth token — 401 |
| ![Not Found](docs/screenshots/books/404-%20wrong%20book%20id.png) | Invalid book ID — 404 |

---

### Book Transactions — `/api/transactions`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/borrow` | ✅ | Librarian, Admin | Issue a book (walk-in or reservation) |
| `PUT` | `/:id/return` | ✅ | Librarian, Admin | Return a borrowed book |
| `PUT` | `/:id/renew` | ✅ | Student, Teacher | Renew a borrowed book |
| `GET` | `/my` | ✅ | Student, Teacher | View own transaction history |
| `GET` | `/` | ✅ | Librarian, Admin | View all transactions |
| `GET` | `/:id` | ✅ | Any | Get single transaction detail |
| `GET` | `/:id/return-details` | ✅ | Librarian, Admin | Get return information |
| `DELETE` | `/:id` | ✅ | Librarian, Admin | Soft delete (recycle bin) |
| `DELETE` | `/:id/permanent` | ✅ | Admin | Permanent delete |
| `PUT` | `/:id/restore` | ✅ | Librarian, Admin | Restore from recycle bin |
| `GET` | `/deleted` | ✅ | Librarian, Admin | View recycle bin |

| Screenshot | Description |
|---|---|
| ![Transaction Success](docs/screenshots/transactions/200-%20transaction%20success.png) | Transaction created — 200 |
| ![My Transactions](docs/screenshots/transactions/200-%20student%20view%20their%20transactions.png) | Student viewing own transactions — 200 |
| ![Forbidden](docs/screenshots/transactions/403-%20forbidden%20unauthorized.png) | Unauthorized role — 403 |
| ![Invalid ID](docs/screenshots/transactions/404-%20invalid%20student%20id%20passed.png) | Invalid student ID — 404 |

---

### Book Reservations — `/api/book-reservation`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/` | ✅ | Student, Teacher | Create a reservation (auto-queue) |
| `PATCH` | `/cancel/:reservationId` | ✅ | Student, Teacher | Cancel own reservation |
| `GET` | `/my-reservations` | ✅ | Student, Teacher | View own reservations |
| `GET` | `/` | ✅ | Librarian | View all reservations |
| `GET` | `/reservations/:id` | ✅ | Librarian | Get reservation by ID |
| `POST` | `/manual-cleanup` | ✅ | Librarian | Trigger expired reservation cleanup |
| `DELETE` | `/delete/:id` | ✅ | Librarian | Delete reservation record |

| Screenshot | Description |
|---|---|
| ![Create Reservation](docs/screenshots/reservations/201-%20create%20reservation%20success.png) | Reservation created — 201 |
| ![Get Reservation](docs/screenshots/reservations/200%20-%20get%20reservation%20by%20id%20success.png) | Get reservation — 200 |
| ![Unauthorized](docs/screenshots/reservations/401-%20unauthorized%20login.png) | Missing auth — 401 |
| ![Not Found](docs/screenshots/reservations/404-%20reserve%20wrong%20book%20id-%20not%20found.png) | Book not found — 404 |

---

### Fines — `/api/fines`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/calculate` | ✅ | Admin, Librarian | Calculate overdue fines |
| `GET` | `/my-fines` | ✅ | Any | View own fines |
| `GET` | `/all` | ✅ | Admin, Librarian | View all fines |
| `GET` | `/all-unpaid` | ✅ | Admin, Librarian | View all unpaid fines |
| `GET` | `/statistics` | ✅ | Admin, Librarian | Fine statistics |
| `GET` | `/user/:userId` | ✅ | Admin, Librarian | View fines by user |
| `GET` | `/:fineId` | ✅ | Admin, Librarian | Get single fine |
| `PATCH` | `/:fineId/pay` | ✅ | Admin, Librarian | Mark fine as paid |
| `PATCH` | `/:fineId/cancel` | ✅ | Admin | Cancel a fine |
| `PATCH` | `/:fineId/refund` | ✅ | Admin | Refund a fine |
| `PUT` | `/:fineId` | ✅ | Admin, Librarian | Update fine amount |
| `DELETE` | `/:fineId` | ✅ | Admin | Delete a fine |

| Screenshot | Description |
|---|---|
| ![Calculate Fines](docs/screenshots/fines/200%20-%20calculate%20fines%20success.png) | Fines calculated — 200 |
| ![Get Fine](docs/screenshots/fines/200%20-%20get%20single%20fine.png) | Single fine detail — 200 |
| ![Unauthorized](docs/screenshots/fines/401%20-%20unathorized%20login.png) | Missing auth — 401 |
| ![Not Found](docs/screenshots/fines/404%20-%20wrong%20fine%20id.png) | Wrong fine ID — 404 |

---

### Reports — `/api/reports`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/` | ✅ | Admin | Generate a new report |
| `GET` | `/` | ✅ | Admin | Get all reports |
| `GET` | `/:id` | ✅ | Admin | Get report by ID |
| `PUT` | `/:id` | ✅ | Admin | Update a report |
| `PATCH` | `/:id/finalize` | ✅ | Admin | Finalize a report |
| `PATCH` | `/:id/restore` | ✅ | Admin | Restore archived report |
| `DELETE` | `/:id` | ✅ | Admin | Archive a report (soft delete) |
| `DELETE` | `/:id/permanent` | ✅ | Admin | Permanently delete |
| `GET` | `/:id/download` | ✅ | Admin | Download report as CSV |

| Screenshot | Description |
|---|---|
| ![Generate Report](docs/screenshots/reports/201%20-%20generate%20report%20success.png) | Report generated — 201 |
| ![Get Report](docs/screenshots/reports/200-%20get%20report%20by%20id%20success.png) | Get report — 200 |
| ![Unauthorized](docs/screenshots/reports/401%20-%20unauthorized%20login.png) | Missing auth — 401 |
| ![Not Found](docs/screenshots/reports/404-%20wrong%20report%20id.png) | Report not found — 404 |

---

### E-Books — `/api/ebooks`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | ✅ | Any | List all e-books |
| `GET` | `/:id` | ✅ | Any | Get e-book details |
| `GET` | `/:id/download` | ✅ | Any | Download e-book PDF |
| `POST` | `/` | ✅ | Librarian, Admin | Upload new e-book |
| `PUT` | `/:id` | ✅ | Librarian, Admin | Update e-book metadata |
| `DELETE` | `/:id` | ✅ | Librarian, Admin | Delete e-book |

---

### Admin Management — `/api/admin`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/librarian` | ✅ | Admin | Create librarian account |
| `GET` | `/librarians` | ✅ | Admin | List all librarians |
| `PUT` | `/librarian/:id` | ✅ | Admin | Update librarian |
| `PATCH` | `/librarian/:id/status` | ✅ | Admin | Toggle librarian active status |
| `DELETE` | `/librarian/:id` | ✅ | Admin | Delete librarian |
| `GET` | `/user/search` | ✅ | Admin, Librarian | Search user by membershipId |
| `GET` | `/user/search-members` | ✅ | Admin, Librarian | Search members (autocomplete) |

---

## 📦 Deployment Report

### Deployment Architecture

| Component | Platform | URL | Tier |
|---|---|---|---|
| **Backend API** | Render | `https://libraryhub-api.onrender.com` | Free |
| **Frontend App** | Vercel | `https://libraryhub.vercel.app` | Free |
| **Database** | MongoDB Atlas | Cloud cluster | Free (M0) |

### Pre-Deployment Changes Made

| File | Change | Purpose |
|---|---|---|
| `Frontend/src/api/axiosInstance.js` | `baseURL` reads from `VITE_API_URL` env var | Dynamic API URL per environment |
| `Backend/index.js` | CORS reads from `CORS_ORIGIN` env var | Restrict origins in production |
| `Frontend/vercel.json` | SPA rewrite rules | Client-side routing works on refresh |
| `Frontend/.env.production` | Production API URL | Points to Render backend |
| `Backend/index.js` | Export `app`, conditional `listen()` | Enables Supertest testing |

### Render (Backend) Deployment Steps

1. **Connect GitHub** → Select `LibraryHub` repo
2. **Root Directory** → `Backend`
3. **Build Command** → `npm install`
4. **Start Command** → `node index.js`
5. **Environment Variables** → Set all 8 variables from table above
6. **Deploy** → Auto-deploys on push to `main`

### Vercel (Frontend) Deployment Steps

1. **Import Repo** → Select `LibraryHub`
2. **Root Directory** → `Frontend`
3. **Framework Preset** → Vite
4. **Environment Variable** → `VITE_API_URL` = Render URL
5. **Deploy** → Auto-deploys on push

### Known Limitations

> ⚠️ **Render Free Tier**: Server sleeps after 15 min of inactivity. First request after sleep takes ~30-50s (cold start).

> ⚠️ **Ephemeral Disk**: Uploaded PDFs/files on Render are lost on redeploy. For production use, integrate cloud storage (AWS S3 / Cloudinary).

---

## 🧪 Testing Instruction Report

### Testing Overview

We implemented **3 types of testing** for quality assurance:

| Type | Tool | Purpose | Tests |
|---|---|---|---|
| **Unit Testing** | Vitest | Test models, middleware, utilities in isolation | 85 |
| **Integration Testing** | Vitest + Supertest | Test API endpoints end-to-end | 47 |
| **Performance Testing** | Artillery | Load test API under heavy traffic | Config ready |
| **Total** | | | **132** |

### Testing Environment Configuration

| Setting | Value |
|---|---|
| **Runtime** | Node.js v20.20.2 (via nvm) |
| **Test Runner** | Vitest 4.1.4 |
| **Backend Test Config** | `Backend/vitest.config.js` |
| **Frontend Test Config** | `Frontend/vite.config.js` (test block) |
| **Frontend Test Environment** | jsdom |
| **Frontend Setup File** | `Frontend/src/test/setup.js` (loads jest-dom) |
| **NODE_ENV during tests** | `test` (prevents server from auto-starting) |

### i. How to Run Unit Tests

Unit tests validate individual models, middleware, and utility functions **without a database**.

#### Backend Unit Tests (70 tests)

```bash
cd Backend
NODE_ENV=test npx vitest run --exclude='test/integration/**'
```

**Test files:**

| File | Tests | What It Validates |
|---|---|---|
| `test/models/book.model.test.js` | 8 | Required fields, enum types, defaults, negative value rejection |
| `test/models/fine.model.test.js` | 8 | Required refs, status enum, amount constraints |
| `test/models/ebook.model.test.js` | 8 | Required fields, category enum, counter defaults |
| `test/models/bookTransaction.model.test.js` | 9 | Required fields, status enum, boolean defaults |
| `test/models/bookReservation.model.test.js` | 12 | Status enum (6 values), queue position, dates |
| `test/models/report.model.test.js` | 18 | 8 required fields, type/status enums, numeric constraints |
| `test/middleware/auth.test.js` | 7 | JWT sign/verify, expiry, header parsing |

#### Frontend Unit Tests (15 tests)

```bash
cd Frontend
npx vitest run
```

| File | Tests | What It Validates |
|---|---|---|
| `src/__tests__/axiosInstance.test.js` | 6 | Base URL config, token interceptor, 401 handler |
| `src/__tests__/authContext.test.js` | 9 | Login/logout state, session persistence, role checks |

**Unit Test Results:**

| Screenshot |
|---|
| ![Backend Unit Tests](docs/screenshots/tests/unit/unit%20tests.png) |
| ![Frontend Unit Tests](docs/screenshots/tests/unit/frontend%20tests.png) |

---

### ii. Integration Testing Setup and Execution

Integration tests hit **real API endpoints** using Supertest against the Express app with a live MongoDB connection.

#### Setup

```bash
cd Backend
npm install -D vitest supertest   # Already installed
```

#### Execution

```bash
# Terminal 1: Start the backend server
cd Backend
node index.js

# Terminal 2: Run integration tests
cd Backend
NODE_ENV=test npx vitest run test/integration/api.test.js
```

#### What is Tested (47 tests)

**Happy Path (21 tests):**
- Health check endpoint
- Auth: login with valid/invalid credentials, logout
- Protected routes return 401 without token
- Authenticated CRUD: books, fines, reports

**Error Scenarios (26 tests):**
- Missing required fields → 400
- Invalid ObjectId format → 400
- Non-existent resources → 404
- Malformed/expired JWT tokens → 401
- Wrong role access → 403
- Date validation (start > end) → 400
- Token invalidation (login → logout → reuse) → 401

**Integration Test Results:**

| Screenshot |
|---|
| ![Integration Tests](docs/screenshots/tests/integration/Integration%20tests.png) |

---

### iii. Performance Testing Setup and Execution

Performance testing uses **Artillery** to simulate hundreds of concurrent users.

#### Setup

```bash
# Install Artillery globally (one-time)
npm install -g artillery
```

#### Execution

```bash
# Make sure the backend server is running first
cd Backend
node index.js

# In another terminal, run the load test
artillery run Backend/test/performance/load-test.yml
```

#### Test Configuration (`Backend/test/performance/load-test.yml`)

| Phase | Duration | Rate | Purpose |
|---|---|---|---|
| **Warm up** | 30s | 10 req/s | Baseline performance |
| **Ramp up** | 60s | 50 req/s | Moderate load handling |
| **Peak load** | 30s | 100 req/s | Stress test limits |

**Scenarios:**
- Health check (40%) — raw throughput
- Login attempt (30%) — CPU + DB intensive
- Book listing (20%) — middleware + query
- Ebook listing (10%) — another protected route

#### How to Read Results

| Metric | Good | Acceptable | Problem |
|---|---|---|---|
| **p95 response time** | < 200ms | < 500ms | > 1000ms |
| **p99 response time** | < 500ms | < 1000ms | > 2000ms |
| **Error rate** | < 0.1% | < 1% | > 5% |

**Performance Test Results:**

| Screenshot | Description |
|---|---|
| ![Warm Up](docs/screenshots/tests/performance/warm-up%2010%20users%20completed.png) | Warm up phase — 10 users/sec |
| ![Ramp Up](docs/screenshots/tests/performance/ramp-up%2050%20users%20completed.png) | Ramp up phase — 50 users/sec |
| ![Peak Load](docs/screenshots/tests/performance/peak%20load-%20100%20users%20completed.png) | Peak load — 100 users/sec |
| ![Summary](docs/screenshots/tests/performance/summary%20report.png) | Full performance summary |

---

### iv. Testing Environment Configuration Details

#### Backend Test Configuration

**`Backend/vitest.config.js`:**
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,        // No need to import describe/it/expect
    testTimeout: 30000,   // 30s timeout for integration tests
  },
});
```

**`Backend/package.json` scripts:**
```json
{
  "test": "NODE_ENV=test vitest run",
  "test:watch": "NODE_ENV=test vitest"
}
```

> `NODE_ENV=test` prevents the server from calling `app.listen()` during tests — Supertest manages the server lifecycle internally.

#### Frontend Test Configuration

**`Frontend/vite.config.js`** (test block):
```javascript
test: {
    globals: true,
    environment: 'jsdom',              // Simulates browser DOM
    setupFiles: './src/test/setup.js', // Loads jest-dom matchers
}
```

**`Frontend/src/test/setup.js`:**
```javascript
import '@testing-library/jest-dom';
```

**`Frontend/package.json` scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

#### Test File Naming Convention

```
Backend/
  test/
    models/           ← *.model.test.js  (unit tests)
    middleware/        ← *.test.js        (unit tests)
    integration/      ← api.test.js       (integration tests)
    performance/      ← load-test.yml     (performance config)

Frontend/
  src/__tests__/      ← *.test.js         (unit tests)
```

---

## 👥 Team Contributions

| Member | Module | Responsibilities |
|---|---|---|
| **Vidura MC** | Project Lead, Book Management, E-Books | System architecture, book CRUD, e-book upload/download, deployment, testing infra |
| **Member 2** | Book Transactions | Borrow/return/renew, recycle bin, transaction history |
| **Member 3** | Book Reservations | Waiting queue, auto-expiry, reservation management |
| **Member 4** | Fine Management | Overdue fine calculation, pay/cancel/refund workflow |
| **Member 5** | Report Management | Report generation, CSV export, archive/restore |

---

## 📁 Project Structure

```
LibraryHub/
├── Backend/
│   ├── config/             # DB connection, admin seed, cron jobs
│   ├── controller/         # Route handler logic
│   ├── middleware/          # auth.js, roleAuth.js, upload.js
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── test/               # Unit + integration + performance tests
│   ├── uploads/            # Uploaded PDFs (e-books)
│   ├── index.js            # Entry point
│   ├── vitest.config.js    # Test configuration
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + API functions
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── pages/          # Page components (by module)
│   │   ├── __tests__/      # Frontend unit tests
│   │   └── test/           # Test setup
│   ├── vite.config.js      # Vite + test configuration
│   ├── vercel.json         # SPA routing for Vercel
│   └── package.json
│
├── docs/
│   └── screenshots/        # API & test screenshots
│       ├── auth/
│       ├── books/
│       ├── transactions/
│       ├── reservations/
│       ├── fines/
│       ├── reports/
│       └── tests/
│           ├── unit/
│           ├── integration/
│           └── performance/
│
└── README.md
```

---

<p align="center">
  <b>LibraryHub</b> — Built with ❤️ by Group [Your Group Number]
</p>
