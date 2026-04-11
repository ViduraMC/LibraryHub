import { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { toast } from 'react-toastify';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        toast.info('You have been signed out.');
        navigate('/login');
    };

    const homeRoutes = {
        admin: '/admin/dashboard',
        librarian: '/transactions',
        student: '/',
        teacher: '/',
    };

    // Route to the correct profile page per role
    const profileRoutes = {
        student: '/my-profile',
        teacher: '/teacher-profile',
        librarian: '/librarian/profile',
        admin: '/admin/profile',
    };

    const homePath = user ? (homeRoutes[user.role] || '/') : '/';
    const profilePath = user ? (profileRoutes[user.role] || null) : null;

    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-sm font-bold text-theme-blue dark:text-theme-pale'
            : 'text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-theme-blue dark:hover:text-theme-pale transition-colors';

    const mobileLinkClass = ({ isActive }) =>
        isActive
            ? 'block px-4 py-3 text-sm font-bold text-theme-blue dark:text-theme-pale bg-blue-50 dark:bg-slate-700/60 rounded-xl'
            : 'block px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-theme-blue dark:hover:text-theme-pale hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-xl transition-colors';

    const guestLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/login', label: 'eResources' },
        { to: '/login', label: 'Books' },
    ];

    const navLinks = {
        admin: [
            { to: '/admin/dashboard', label: 'Dashboard' },
            { to: '/admin/librarians', label: 'Librarians' },
            { to: '/admin/school-lists', label: 'School Lists' },
            { to: '/admin/reports', label: 'Reports' },
        ],
        librarian: [
            { to: '/transactions', label: 'Transactions' },
            { to: '/borrow', label: 'New Borrow' },
            { to: '/membership-requests', label: 'Membership Requests' },
            { to: '/librarian/reservations', label: 'Reservations' },
            { to: '/librarian/recycle-bin', label: 'Recycle Bin' },
            { to: '/librarian/fines', label: 'Fine Management' },
            { to: '/librarian/books', label: 'Book Management' },
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

    const initials = user?.fullName
        ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    // Avatar — renders as a Link if the role has a profile page, plain div otherwise
    const AvatarButton = ({ onClick, className }) => {
        const inner = user?.profileImageURL ? (
            <img src={user.profileImageURL} alt={user.fullName} className="w-full h-full object-cover" />
        ) : (
            <span className="text-[11px] font-extrabold text-white tracking-wide select-none">{initials}</span>
        );

        if (profilePath) {
            return (
                <Link to={profilePath} title="My Profile" onClick={onClick} className={className}>
                    {inner}
                </Link>
            );
        }
        return <div className={className}>{inner}</div>;
    };

    return (
        <nav className="bg-theme-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">

            {/* ── Top bar ── */}
            <div className="px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link to={homePath} className="flex items-center gap-2 group shrink-0">
                    <div className="w-8 h-8 bg-theme-navy rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                        <div className="w-4 h-4 bg-theme-pale rotate-45 transform translate-x-2 translate-y-2"></div>
                    </div>
                    <span className="text-xl font-bold font-sans text-theme-navy dark:text-white tracking-tight uppercase">
                        LibraryHub
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {links.map(({ to, label }) => (
                        <NavLink key={label} to={to} className={linkClass}>
                            {label}
                        </NavLink>
                    ))}
                </div>

                {/* Right-side controls */}
                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-theme-navy dark:hover:text-theme-pale hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {user ? (
                        <>
                            {/* Name + role — desktop only */}
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">
                                    {user.fullName}
                                </p>
                                <p className="text-[10px] font-bold text-theme-blue dark:text-theme-pale uppercase tracking-widest">
                                    {user.role}
                                </p>
                            </div>

                            <div className="hidden lg:block h-8 w-px bg-slate-100 dark:bg-slate-700 mx-1"></div>

                            {/* Profile avatar — student & teacher, desktop */}
                            {profilePath && (
                                <AvatarButton
                                    className="hidden md:flex w-9 h-9 rounded-xl bg-theme-navy dark:bg-slate-700 items-center justify-center shrink-0 overflow-hidden
                                               ring-2 ring-transparent hover:ring-theme-blue dark:hover:ring-theme-pale transition-all"
                                />
                            )}

                            {/* Logout — desktop */}
                            <button
                                onClick={handleLogout}
                                className="hidden md:flex p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                title="Sign Out"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>

                            {/* Hamburger — mobile */}
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                aria-label="Toggle menu"
                            >
                                {menuOpen ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="px-5 py-2 text-theme-navy dark:text-slate-300 text-sm font-bold rounded-xl hover:text-theme-blue dark:hover:text-white transition-colors">
                                Membership
                            </Link>
                            <Link to="/login" className="px-5 py-2 bg-theme-navy text-white text-sm font-bold rounded-xl hover:bg-theme-blue transition-colors">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ── Mobile drawer ── */}
            {menuOpen && user && (
                <div className="md:hidden border-t border-slate-100 dark:border-slate-700 bg-theme-white dark:bg-slate-800 px-4 pb-4">

                    {/* User info pill */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 mt-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <AvatarButton
                            onClick={() => setMenuOpen(false)}
                            className="w-9 h-9 rounded-xl bg-theme-navy dark:bg-slate-600 flex items-center justify-center shrink-0 overflow-hidden"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.fullName}</p>
                            <p className="text-[10px] font-bold text-theme-blue dark:text-theme-pale uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="flex flex-col gap-0.5">
                        {links.map(({ to, label }) => (
                            <NavLink key={label} to={to} className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                                {label}
                            </NavLink>
                        ))}

                        {/* My Profile link — student & teacher */}
                        {profilePath && (
                            <NavLink to={profilePath} className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                                My Profile
                            </NavLink>
                        )}
                    </div>

                    {/* Logout */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;