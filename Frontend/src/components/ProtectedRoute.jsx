import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// wraps any page that requires login
// if not logged in — redirects to /login
// if role restriction given — checks the role too
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    // wait for localStorage to be read before deciding
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
