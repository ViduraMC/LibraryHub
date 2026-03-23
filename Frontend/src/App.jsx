import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';

// --- Public auth pages ---
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import SetPasswordPage from './pages/auth/SetPasswordPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';

// --- Admin pages (admin only) ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminLibrariansPage from './pages/admin/AdminLibrariansPage.jsx';
import AdminSchoolListsPage from './pages/admin/AdminSchoolListsPage.jsx';

// --- Librarian pages (librarian only) ---
import LibrarianMembershipPage from './pages/librarian/LibrarianMembershipPage.jsx';

// --- Transaction pages (handled in feature/frontend-transactions) ---
import MyTransactionsPage from './pages/transactions/MyTransactionsPage.jsx';
import AllTransactionsPage from './pages/transactions/AllTransactionsPage.jsx';
import BorrowBookPage from './pages/transactions/BorrowBookPage.jsx';
import RecycleBinPage from './pages/transactions/RecycleBinPage.jsx';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ── Public routes (no login required) ─────────────────── */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/set-password" element={<SetPasswordPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Default: redirect / to /login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* ── Protected routes (must be logged in) ──────────────── */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

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
                    </Route>
                </Routes>
            </Router>

            {/* Global toast notifications */}
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
    );
}

export default App;
