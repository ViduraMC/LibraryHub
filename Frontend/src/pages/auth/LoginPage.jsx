import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser } from '../../api/auth.api.js';

/**
 * Unified login interface for all roles (Admin, Librarian, Student, Teacher).
 * Automatically detects credential type and routes users to their respective dashboards.
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

        // handle credential detection logic
        // if it contains @ it is an email (Admin/Librarian)
        // otherwise it is a membershipId (Student/Teacher)
        const credentials = identifier.includes('@') 
            ? { email: identifier.trim().toLowerCase(), password }
            : { membershipId: identifier.trim().toUpperCase(), password };

        try {
            const res = await loginUser(credentials);
            const { token, user } = res.data;

            login(user, token);
            toast.success(`Welcome back, ${user.fullName}!`);

            // redirect based on user role
            if (user.role === 'student' || user.role === 'teacher') {
                navigate('/my-transactions');
            } else {
                navigate('/transactions');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-meridian-white">
            {/* Left side: Hero/Marketing (Inspired by Meridian design) */}
            <div className="hidden lg:flex lg:w-1/2 bg-meridian-pale items-center justify-center p-12">
                <div className="max-w-lg">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-meridian-blue uppercase bg-white rounded-full shadow-sm">
                        Meridian School Library • Est. 1982
                    </span>
                    <h1 className="text-5xl font-bold leading-tight text-meridian-navy mb-6">
                        Where Every Page Opens a <span className="text-meridian-blue text-6xl block mt-2">New World</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Explore thousands of books, journals, and digital resources curated for students and educators. 
                        Your knowledge journey starts here.
                    </p>
                    <div className="flex gap-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm flex-1">
                            <div className="h-2 w-12 bg-meridian-navy rounded-full mb-3"></div>
                            <p className="text-sm font-medium text-slate-500">Resource Access</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm flex-1">
                            <div className="h-2 w-12 bg-meridian-blue rounded-full mb-3"></div>
                            <p className="text-sm font-medium text-slate-500">Digital Catalog</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Unified Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    {/* logo/header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-meridian-navy rounded-xl flex items-center justify-center overflow-hidden">
                                <div className="w-5 h-5 bg-meridian-pale rotate-45 transform translate-x-3 translate-y-3"></div>
                                <div className="w-5 h-5 bg-white rotate-45 transform -translate-x-3 -translate-y-3"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-meridian-navy tracking-tight">Meridian Library</h2>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">Welcome Back</h3>
                        <p className="text-slate-500 mt-2">Please enter your account details to continue.</p>
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
                                placeholder="Enter your credentials"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-meridian-blue/20 focus:border-meridian-blue transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                                Admin/Librarian uses email. Students/Teachers use Membership ID (e.g., ST-26-XXXX).
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-meridian-blue hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-meridian-blue/20 focus:border-meridian-blue transition-all"
                            />
                        </div>

                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="remember" 
                                className="w-4 h-4 text-meridian-blue border-slate-300 rounded focus:ring-meridian-blue" 
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
                                Remember this device
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-meridian-navy text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-meridian-navy/10 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center border-t border-slate-100 pt-8">
                        <p className="text-sm text-slate-500">
                            Don't have an account? <span className="text-meridian-blue font-bold cursor-pointer hover:underline">Contact the librarian</span>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
