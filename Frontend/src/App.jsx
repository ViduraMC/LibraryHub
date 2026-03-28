import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute, { StaffBlockedRoute } from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// --- Public pages ---
import HomePage from './pages/main-site/Home.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import AboutPage from './pages/main-site/About.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import SetPasswordPage from './pages/auth/SetPasswordPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';

// --- Admin pages (admin only) ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminLibrariansPage from './pages/admin/AdminLibrariansPage.jsx';
import AdminSchoolListsPage from './pages/admin/AdminSchoolListsPage.jsx';

// --- Librarian pages (librarian only) ---
import LibrarianMembershipPage from './pages/librarian/LibrarianMembershipPage.jsx';
import FineManagementPage from './pages/librarian/FineManagementPage.jsx';
import LibrarianReservationPage from './pages/librarian/LibrarianReservationPage.jsx';

// --- Transaction pages ---
import MyTransactionsPage from './pages/transactions/MyTransactionsPage.jsx';
import AllTransactionsPage from './pages/transactions/AllTransactionsPage.jsx';
import BorrowBookPage from './pages/transactions/BorrowBookPage.jsx';
import RecycleBinPage from './pages/transactions/RecycleBinPage.jsx';

// --- Student/Teacher pages ---
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
                        {/* ── Public routes (no login required) ─────────────────── */}

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/set-password" element={<SetPasswordPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* Default: redirect / to /login
                    <Route path="/" element={<Navigate to="/login" replace />} /> */}

                        <Route element={<MainLayout />}>
                            <Route path="/" element={<StaffBlockedRoute><HomePage /></StaffBlockedRoute>} />
                            <Route path="/about" element={<StaffBlockedRoute><AboutPage /></StaffBlockedRoute>} />

                        </Route>

                        {/* ── Protected routes (must be logged in) ──────────────── */}
                        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

                            {/* Admin-only routes */}
                            <Route
                                path="/admin/*"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <Routes>
                                            <Route path="dashboard" element={<AdminDashboardPage />} />
                                            <Route path="librarians" element={<AdminLibrariansPage />} />
                                            <Route path="school-lists" element={<AdminSchoolListsPage />} />
                                        </Routes>

                                    </ProtectedRoute>
                                }
                            />

                            {/* Librarian-only routes */}
                            <Route
                                path="/librarian/*"
                                element={
                                    <ProtectedRoute allowedRoles={['librarian']}>
                                        <Routes>
                                            <Route path="membership-requests" element={<LibrarianMembershipPage />} />
                                            <Route path="transactions" element={<AllTransactionsPage />} />
                                            <Route path="borrow" element={<BorrowBookPage />} />
                                            <Route path="recycle-bin" element={<RecycleBinPage />} />
                                            <Route path="fines" element={<FineManagementPage />} />
                                        </Routes>

                                    </ProtectedRoute>
                                }
                            />

                            {/* Student / Teacher routes - explicit paths instead of catch-all /* */}
                            <Route path="/my-transactions" element={
                                <ProtectedRoute allowedRoles={['student', 'teacher']}><MyTransactionsPage /></ProtectedRoute>
                            } />
                            <Route path="/my-reservations" element={
                                <ProtectedRoute allowedRoles={['student', 'teacher']}><MyReservationsPage /></ProtectedRoute>
                            } />
                            <Route path="/e-resources" element={
                                <ProtectedRoute allowedRoles={['student', 'teacher']}><ResourcesPage /></ProtectedRoute>
                            } />
                            <Route path="/books" element={
                                <ProtectedRoute allowedRoles={['student', 'teacher']}><BooksPage /></ProtectedRoute>
                            } />

                        </Route>
                    </Routes>
                </Router>

                {/* Global toast notifications */}
                <ToastContainer position="top-right" autoClose={3000} />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
