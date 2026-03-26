import { Link } from 'react-router-dom';

/**
 * Premium footer component for LibraryHub.
 * 3-column layout: Brand | Quick Links | Library Hours & Contact.
 * Separated from MainLayout for single responsibility.
 */
const Footer = () => {
    const quickLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About Us' },
        { to: '/books', label: 'Browse Books' },
        { to: '/e-resources', label: 'eResources' },
        { to: '/login', label: 'Sign In' },
        { to: '/register', label: 'Membership' },
    ];

    return (
        <footer className="bg-[#0A2463] text-white mt-12">
            {/* Main footer content */}
            <div className="container mx-auto px-6 pt-14 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                                <svg className="h-5 w-5 text-[#DBEAFE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-lg font-black tracking-tight uppercase">LibraryHub</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Your school library, reimagined. Modern book management, digital resources,
                            and seamless borrowing — all in one platform.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#DBEAFE] mb-5">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map(({ to, label }) => (
                                <li key={label}>
                                    <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                        <svg className="h-3 w-3 text-slate-600 group-hover:text-[#DBEAFE] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Library Hours & Contact */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#DBEAFE] mb-5">Library Hours</h4>
                        <div className="space-y-3 text-sm text-slate-400">
                            <div className="flex justify-between">
                                <span>Monday – Friday</span>
                                <span className="text-white font-bold">7:30 AM – 4:00 PM</span>
                            </div>

                            <div className="pt-3 mt-3 border-t border-white/10">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <svg className="h-4 w-4 text-[#DBEAFE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href="mailto:libraryhub.se@gmail.com" className="text-sm hover:text-white transition-colors">
                                        libraryhub.se@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} LibraryHub Management System. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Follow Us</span>
                        {/* Facebook */}
                        <a href="#" className="text-slate-500 hover:text-[#DBEAFE] transition-colors" aria-label="Facebook">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        {/* X / Twitter */}
                        <a href="#" className="text-slate-500 hover:text-[#DBEAFE] transition-colors" aria-label="Twitter">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" className="text-slate-500 hover:text-[#DBEAFE] transition-colors" aria-label="Instagram">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
