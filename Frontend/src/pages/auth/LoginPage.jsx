import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser } from '../../api/auth.api.js';

/**
 * Unified login page for all four roles: admin, librarian, student, teacher.
 * - Admin / Librarian log in with email + password
 * - Student / Teacher log in with membershipId + password
 *
 * After successful login, each role is redirected to its dedicated dashboard:
 *   admin     → /admin/dashboard
 *   librarian → /transactions
 *   student   → /my-transactions
 *   teacher   → /my-transactions
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Detect credential type: email (contains @) or membershipId
        const credentials = identifier.includes('@')
            ? { email: identifier.trim().toLowerCase(), password }
            : { membershipId: identifier.trim().toUpperCase(), password };

        try {
            const res = await loginUser(credentials);
            const { token, user } = res.data;

            login(user, token);
            toast.success(`Welcome back, ${user.fullName}!`);

            // Role-based redirect
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'librarian') {
                navigate('/transactions');
            } else {
                // student or teacher
                navigate('/my-transactions');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-theme-white">
            {/* Left side: branding panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-theme-pale items-center justify-center p-12">
                <div className="max-w-lg text-center lg:text-left">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-theme-blue uppercase bg-white rounded-full shadow-sm">
                        Digital Knowledge Hub
                    </span>
                    <h1 className="text-5xl font-bold leading-tight text-theme-navy mb-6">
                        Where Every Page Opens a{' '}
                        <span className="text-theme-blue text-6xl block mt-2">New World</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Access thousands of academic resources, digital catalogs, and transaction
                        history — all in one place.
                    </p>
                    <div className="flex gap-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm flex-1">
                            <div className="h-2 w-12 bg-theme-navy rounded-full mb-3"></div>
                            <p className="text-sm font-medium text-slate-500">Resource Access</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm flex-1">
                            <div className="h-2 w-12 bg-theme-blue rounded-full mb-3"></div>
                            <p className="text-sm font-medium text-slate-500">Digital Catalog</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: login form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Brand mark */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-theme-navy rounded-xl flex items-center justify-center overflow-hidden">
                                <div className="w-5 h-5 bg-theme-pale rotate-45 transform translate-x-3 translate-y-3"></div>
                                <div className="w-5 h-5 bg-white rotate-45 transform -translate-x-3 -translate-y-3"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-theme-navy tracking-tight uppercase">
                                LibraryHub
                            </h2>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">Welcome Back</h3>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                            Sign in to manage your library profile and track transactions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email or Membership ID
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                placeholder="admin@email.com  or  ST-26-0001"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 ml-1 italic">
                                Use your email for admin/librarian login, or membership ID for members.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-theme-navy text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Registration link for students & teachers */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            New student or teacher?{' '}
                            <Link
                                to="/register"
                                className="text-theme-blue font-bold hover:underline"
                            >
                                Apply for library membership
                            </Link>
                        </p>
                    </div>

                    <footer className="mt-8 text-center border-t border-slate-100 pt-6">
                        <p className="text-sm text-slate-500 font-medium">
                            Need help?{' '}
                            <span className="text-theme-blue font-bold cursor-pointer hover:underline">
                                Contact System Admin
                            </span>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
