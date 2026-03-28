import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import ProtectedRoute, { StaffBlockedRoute } from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// --- Public pages ---
import HomePage from './pages/main-site/Home.jsx';
import AboutPage from './pages/main-site/About.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import SetPasswordPage from './pages/auth/SetPasswordPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';

// --- Admin pages ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminLibrariansPage from './pages/admin/AdminLibrariansPage.jsx';
import AdminSchoolListsPage from './pages/admin/AdminSchoolListsPage.jsx';

// --- Report pages (admin only) ---
import ReportsListPage from './pages/reports/ReportsListPage.jsx';
import CreateReportPage from './pages/reports/CreateReportPage.jsx';
import ReportDetailsPage from './pages/reports/ReportDetailsPage.jsx';
import EditReportPage from './pages/reports/EditReportPage.jsx';
import ArchivedReportsPage from './pages/reports/ArchivedReportsPage.jsx';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage.jsx';

// --- Librarian pages ---
import LibrarianMembershipPage from './pages/librarian/LibrarianMembershipPage.jsx';
import LibrarianReservationPage from './pages/librarian/LibrarianReservationPage.jsx';

// --- Transaction pages ---
import MyTransactionsPage from './pages/transactions/MyTransactionsPage.jsx';
import AllTransactionsPage from './pages/transactions/AllTransactionsPage.jsx';
import BorrowBookPage from './pages/transactions/BorrowBookPage.jsx';
import RecycleBinPage from './pages/transactions/RecycleBinPage.jsx';

// --- Student / Teacher pages ---
import ResourcesPage from './pages/main-site/Resources.jsx';
import BooksPage from './pages/main-site/Books.jsx';
import MyReservationsPage from './pages/reservations/MyReservations.jsx';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <ScrollToTop />

                    <Routes>
                        {/* ── Public auth routes ───────────────────────────── */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/set-password" element={<SetPasswordPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* ── Public main-site routes (staff blocked) ─────── */}
                        <Route element={<MainLayout />}>
                            <Route
                                path="/"
                                element={
                                    <StaffBlockedRoute>
                                        <HomePage />
                                    </StaffBlockedRoute>
                                }
                            />
                            <Route
                                path="/about"
                                element={
                                    <StaffBlockedRoute>
                                        <AboutPage />
                                    </StaffBlockedRoute>
                                }
                            />
                        </Route>

                        {/* ── Protected routes (must be logged in) ────────── */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Admin-only routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/librarians"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminLibrariansPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/school-lists"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminSchoolListsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Report routes - admin only */}
                            <Route
                                path="/admin/reports"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ReportsListPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports/create"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <CreateReportPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports/archived"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ArchivedReportsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports/analysis"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ReportsDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ReportDetailsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports/:id/edit"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <EditReportPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Librarian-only routes */}
                            <Route
                                path="/membership-requests"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian']}>
                                        <LibrarianMembershipPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/librarian/reservations"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian']}>
                                        <LibrarianReservationPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Staff shared routes */}
                            <Route
                                path="/transactions"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                                        <AllTransactionsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/borrow"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                                        <BorrowBookPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/recycle-bin"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                                        <RecycleBinPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Student / Teacher routes */}
                            <Route
                                path="/my-transactions"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                                        <MyTransactionsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-reservations"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                                        <MyReservationsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/e-resources"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                                        <ResourcesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/books"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                                        <BooksPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </Router>

                <ToastContainer position="top-right" autoClose={3000} />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;