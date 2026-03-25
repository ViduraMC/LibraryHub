import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

// Role-based navigation bar.
// Each role sees its own set of nav links, and clicking the logo
// brings them back to their own dashboard (not the login page).
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // client-side only — clears localStorage and state
        toast.info('You have been signed out.');
        navigate('/login');
    };

    // if (!user) return null;

    // Where the logo click should go, based on role
    const homeRoutes = {
        admin: '/admin/dashboard',
        librarian: '/librarian/transactions',
        student: '/',
        teacher: '/',
    };
    const homePath = user ? (homeRoutes[user.role] || '/') : '/';

    // Active link style — shared across all roles
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-sm font-bold text-theme-blue'
            : 'text-sm font-semibold text-slate-600 hover:text-theme-blue transition-colors';

    // Guest links — only public pages; My Transactions / My Reservations
    // are private and only shown to logged-in students/teachers
    const guestLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/login', label: 'eResources' },
        { to: '/login', label: 'Books' },
    ];

    // Nav link sets per role
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
        <nav className="bg-theme-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Brand + Nav links */}
            <div className="flex items-center gap-8">
                {/* Logo — goes to the role's own home dashboard, not / */}
                <Link to={homePath} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-theme-navy rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                        <div className="w-4 h-4 bg-theme-pale rotate-45 transform translate-x-2 translate-y-2"></div>
                    </div>
                    <span className="text-xl font-bold font-sans text-theme-navy tracking-tight uppercase">
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

            {/* User info + Logout */}
            {user ? (
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link
                        to="/register"
                        className="px-5 py-2 text-theme-navy text-sm font-bold rounded-xl hover:text-theme-blue transition-colors"
                    >
                        Membership
                    </Link>
                    <Link
                        to="/login"
                        className="px-5 py-2 bg-theme-navy text-white text-sm font-bold rounded-xl hover:bg-theme-blue transition-colors"
                    >
                        Login
                    </Link>
                </div>
            )}
        </nav>
    );
};
export default Navbar;
