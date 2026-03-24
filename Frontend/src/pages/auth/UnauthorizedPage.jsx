import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Shown when a logged-in user tries to access a route
// they don't have permission for (e.g. a student hitting /transactions).
const UnauthorizedPage = () => {
    const { user } = useAuth();

    // Where to send each role when they click "Back to Dashboard"
    const homeRoutes = {
        admin:     '/admin/dashboard',
        librarian: '/librarian/transactions',
        student:   '/',
        teacher:   '/',
    };
    const homePath = user ? (homeRoutes[user.role] || '/login') : '/login';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-theme-pale p-8">
            <div className="max-w-md w-full text-center bg-white p-12 rounded-3xl shadow-xl shadow-theme-navy/5">
                {/* Icon */}
                <div className="mb-8 inline-block">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-5xl font-black text-theme-navy mb-4 tracking-tight">403</h1>
                <p className="text-2xl font-bold text-slate-800 mb-2">Access Denied</p>
                <p className="text-slate-500 mb-10 leading-relaxed text-sm">
                    Your account doesn't have permission to view this page.
                    If you think this is a mistake, contact your system administrator.
                </p>

                <div className="space-y-4">
                    {/* Goes to the role's actual dashboard, not just navigate(-1) */}
                    <Link
                        to={homePath}
                        className="w-full px-8 py-4 bg-theme-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 flex items-center justify-center gap-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to My Dashboard
                    </Link>

                    <Link
                        to="/login"
                        className="w-full px-8 py-3 bg-white text-theme-blue border border-theme-pale rounded-xl font-semibold hover:bg-theme-pale transition-all flex items-center justify-center"
                    >
                        Switch Account
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest font-bold">
                LibraryHub System
            </p>
        </div>
    );
};

export default UnauthorizedPage;
