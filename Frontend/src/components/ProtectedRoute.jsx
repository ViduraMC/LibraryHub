import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// route guard to protect pages that require login
// redirects to login if not authenticated
// checks for allowed roles if specified
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    // wait for auth state to load
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // check role access if roles are specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
