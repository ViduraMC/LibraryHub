import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// auth pages (Phase 8 — feature/frontend-login)
import LoginPage from './pages/auth/LoginPage.jsx';
import SetPasswordPage from './pages/auth/SetPasswordPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';

// transaction pages — added in feature/frontend-transactions (Phase 9)
// import MyTransactionsPage from './pages/transactions/MyTransactionsPage.jsx';
// import AllTransactionsPage from './pages/transactions/AllTransactionsPage.jsx';
// import BorrowBookPage from './pages/transactions/BorrowBookPage.jsx';
// import RecycleBinPage from './pages/transactions/RecycleBinPage.jsx';

// other members' pages — each member adds their own imports here
// import BookListPage from './pages/books/BookListPage.jsx';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/set-password" element={<SetPasswordPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* transaction routes — added in feature/frontend-transactions */}
                    {/* <Route path="/my-transactions" element={<ProtectedRoute allowedRoles={['student', 'teacher']}><MyTransactionsPage /></ProtectedRoute>} /> */}
                    {/* <Route path="/transactions" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><AllTransactionsPage /></ProtectedRoute>} /> */}
                    {/* <Route path="/borrow" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><BorrowBookPage /></ProtectedRoute>} /> */}
                    {/* <Route path="/recycle-bin" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><RecycleBinPage /></ProtectedRoute>} /> */}
                </Routes>
            </Router>

            {/* global toast notifications */}
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
    );
}

export default App;
