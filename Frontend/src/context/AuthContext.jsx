import { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '../api/auth.api.js';

const AuthContext = createContext(null);

// Provides authentication state (user, token) to the entire application.
// Session is persisted in localStorage so it survives page reloads.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On first mount: restore session from localStorage if available
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Called after a successful login API response
    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Calls the backend to blacklist the token, then clears local state.
    // Even if the API call fails, we still clear the local session so
    // the user is logged out from the frontend regardless.
    const logout = async () => {
        try {
            await logoutUser();
        } catch {
            // silently ignore; token may already be expired or invalid
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook - enforces that AuthContext is only used inside AuthProvider
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};
