import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

/**
 * Role-based navigation bar.
 *
 * Each role sees a completely different set of links:
 *   admin     → Dashboard, Librarians, School Lists
 *   librarian → Transactions, New Borrow, Membership Requests, Recycle Bin
 *   student   → My Borrows
 *   teacher   → My Borrows
 */
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // client-side only — clears localStorage and state
        toast.info('You have been signed out.');
        navigate('/login');
    };

    if (!user) return null;

    // Active link style — shared across all roles
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-sm font-bold text-theme-blue'
            : 'text-sm font-semibold text-slate-600 hover:text-theme-blue transition-colors';

    // Nav link sets per role
    const navLinks = {
        admin: [
            { to: '/admin/dashboard', label: 'Dashboard' },
            { to: '/admin/librarians', label: 'Librarians' },
            { to: '/admin/school-lists', label: 'School Lists' },
        ],
        librarian: [
            { to: '/transactions', label: 'Transactions' },
            { to: '/borrow', label: 'New Borrow' },
            { to: '/membership-requests', label: 'Membership Requests' },
            { to: '/recycle-bin', label: 'Recycle Bin' },
        ],
        student: [{ to: '/my-transactions', label: 'My Borrows' }],
        teacher: [{ to: '/my-transactions', label: 'My Borrows' }],
    };

    const links = navLinks[user.role] || [];

    return (
        <nav className="bg-theme-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Brand + Nav links */}
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-theme-navy rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                        <div className="w-4 h-4 bg-theme-pale rotate-45 transform translate-x-2 translate-y-2"></div>
                    </div>
                    <span className="text-xl font-bold font-sans text-theme-navy tracking-tight uppercase">
                        LibraryHub
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {links.map(({ to, label }) => (
                        <NavLink key={to} to={to} className={linkClass}>
                            {label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* User info + Logout */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                        {user.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-theme-blue uppercase tracking-widest">
                        {user.role}
                    </p>
                </div>

                <div className="h-8 w-px bg-slate-100 mx-2"></div>

                <button
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Sign Out"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
