import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { logoutUser } from '../api/auth.api.js';

/**
 * Shared navigation bar for authenticated users.
 * Displays user identity and provides role-based navigation and logout.
 */
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            toast.info('Session terminated. See you soon!');
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
            // even if server fails, we clear local session
            logout();
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <nav className="bg-meridian-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-meridian-navy rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                        <div className="w-4 h-4 bg-meridian-pale rotate-45 transform translate-x-2 translate-y-2"></div>
                    </div>
                    <span className="text-xl font-bold font-sans text-meridian-navy tracking-tight">Meridian</span>
                </Link>

                {/* Navigation Links (Role-based) */}
                <div className="hidden md:flex items-center gap-6">
                    {user.role === 'student' || user.role === 'teacher' ? (
                        <Link to="/my-transactions" className="text-sm font-semibold text-slate-600 hover:text-meridian-blue transition-colors">
                            My Borrows
                        </Link>
                    ) : (
                        <>
                            <Link to="/transactions" className="text-sm font-semibold text-slate-600 hover:text-meridian-blue transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/borrow" className="text-sm font-semibold text-slate-600 hover:text-meridian-blue transition-colors">
                                New Borrow
                            </Link>
                            <Link to="/recycle-bin" className="text-sm font-semibold text-slate-600 hover:text-meridian-blue transition-colors">
                                Recycle Bin
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.fullName}</p>
                    <p className="text-[10px] font-bold text-meridian-blue uppercase tracking-widest">{user.role}</p>
                </div>
                
                <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                
                <button
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Sign Out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
