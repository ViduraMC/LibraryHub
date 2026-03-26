import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { toast } from 'react-toastify';

/**
 * Role-based navigation bar with dark mode toggle.
 * Each role sees its own set of nav links.
 */
const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info('You have been signed out.');
        navigate('/login');
    };

    // Where the logo click should go, based on role
    const homeRoutes = {
        admin: '/admin/dashboard',
        librarian: '/librarian/transactions',
        student: '/',
        teacher: '/',
    };
    const homePath = user ? (homeRoutes[user.role] || '/') : '/';

    // Active link style
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-sm font-bold text-theme-blue dark:text-theme-pale'
            : 'text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-theme-blue dark:hover:text-theme-pale transition-colors';

    // Guest links
    const guestLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/login', label: 'eResources' },
        { to: '/login', label: 'Books' },
    ];

    // Nav links per role
    const navLinks = {
        admin: [
            { to: '/admin/dashboard', label: 'Dashboard' },
            { to: '/admin/librarians', label: 'Librarians' },
            { to: '/admin/school-lists', label: 'School Lists' },
        ],
        librarian: [
            { to: '/librarian/transactions', label: 'Transactions' },
            { to: '/librarian/borrow', label: 'New Borrow' },
            { to: '/librarian/membership-requests', label: 'Membership Requests' },
            { to: '/librarian/recycle-bin', label: 'Recycle Bin' },
        ],
        student: [
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            { to: '/e-resources', label: 'eResources' },
            { to: '/books', label: 'Books' },
            { to: '/my-transactions', label: 'My Transactions' },
            { to: '/my-reservations', label: 'My Reservations' },
        ],
        teacher: [
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            { to: '/e-resources', label: 'eResources' },
            { to: '/books', label: 'Books' },
            { to: '/my-transactions', label: 'My Transactions' },
            { to: '/my-reservations', label: 'My Reservations' },
        ],
    };

    const links = user ? (navLinks[user.role] || []) : guestLinks;

    return (
        <nav className="bg-theme-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
            {/* Brand + Nav links */}
            <div className="flex items-center gap-8">
                <Link to={homePath} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-theme-navy rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                        <div className="w-4 h-4 bg-theme-pale rotate-45 transform translate-x-2 translate-y-2"></div>
                    </div>
                    <span className="text-xl font-bold font-sans text-theme-navy dark:text-white tracking-tight uppercase">
                        LibraryHub
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {links.map(({ to, label }) => (
                        <NavLink key={label} to={to} className={linkClass}>
                            {label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Right side: theme toggle + user info */}
            <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-theme-navy dark:hover:text-theme-pale hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        /* Sun icon - shown in dark mode */
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        /* Moon icon - shown in light mode */
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {user ? (
                    <>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">
                                {user.fullName}
                            </p>
                            <p className="text-[10px] font-bold text-theme-blue dark:text-theme-pale uppercase tracking-widest">
                                {user.role}
                            </p>
                        </div>

                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-1"></div>

                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/register"
                            className="px-5 py-2 text-theme-navy dark:text-slate-300 text-sm font-bold rounded-xl hover:text-theme-blue dark:hover:text-white transition-colors"
                        >
                            Membership
                        </Link>
                        <Link
                            to="/login"
                            className="px-5 py-2 bg-theme-navy text-white text-sm font-bold rounded-xl hover:bg-theme-blue transition-colors"
                        >
                            Login
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
