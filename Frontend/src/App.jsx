import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';

// auth pages
import LoginPage from './pages/auth/LoginPage.jsx';
import SetPasswordPage from './pages/auth/SetPasswordPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';

// transaction pages
import MyTransactionsPage from './pages/transactions/MyTransactionsPage.jsx';
import AllTransactionsPage from './pages/transactions/AllTransactionsPage.jsx';
import BorrowBookPage from './pages/transactions/BorrowBookPage.jsx';
import RecycleBinPage from './pages/transactions/RecycleBinPage.jsx';

// other core modules
// import BookListPage from './pages/books/BookListPage.jsx';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* public auth routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/set-password" element={<SetPasswordPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* default redirect to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* protected application routes */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/my-transactions" element={<ProtectedRoute allowedRoles={['student', 'teacher']}><MyTransactionsPage /></ProtectedRoute>} />
                        <Route path="/transactions" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><AllTransactionsPage /></ProtectedRoute>} />
                        <Route path="/borrow" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><BorrowBookPage /></ProtectedRoute>} />
                        <Route path="/recycle-bin" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><RecycleBinPage /></ProtectedRoute>} />
                    </Route>
                </Routes>
            </Router>

            {/* toast notifications for the whole app */}
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
    );
}

export default App;
