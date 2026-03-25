import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';


const services = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        title: 'Book Borrowing',
        desc: 'Borrow from thousands of titles across all subjects and genres with easy renewals.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        title: 'eResources',
        desc: 'Access digital journals, e-books, and academic databases from anywhere.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'Reservations',
        desc: 'Reserve books in advance and get notified when they are ready for pickup.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        title: 'Borrow History',
        desc: 'Track your full borrow history, due dates, and manage renewals online.',
    },
];

const announcements = [
    {
        tag: 'New Arrivals',
        tagColor: 'bg-blue-100 text-blue-700',
        title: 'Science & Technology Collection Expanded',
        date: 'March 20, 2025',
        desc: 'Over 200 new titles added to the Science and Technology section, including the latest engineering and computer science textbooks.',
    },
    {
        tag: 'Notice',
        tagColor: 'bg-amber-100 text-amber-700',
        title: 'Library Hours — Term Break',
        date: 'March 15, 2025',
        desc: 'During the upcoming term break, the library will operate from 9 AM to 1 PM on weekdays only. Normal hours resume April 7.',
    },
    {
        tag: 'Event',
        tagColor: 'bg-emerald-100 text-emerald-700',
        title: 'Annual Reading Challenge 2025',
        date: 'March 10, 2025',
        desc: 'Sign up for the annual reading challenge and earn recognition for completing books across different genres this term.',
    },
];

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-20 pb-16">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative rounded-3xl overflow-hidden min-h-[520px] flex items-end">

                {/* Background image */}
                <img
                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80"
                    alt="School library with students reading"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Gradient overlay — dark at bottom, lighter toward top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2463]/90 via-[#0A2463]/50 to-[#0A2463]/10" />

                {/* Subtle top-left tint for legibility if text were placed there */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A2463]/40 to-transparent" />

                {/* Content sits at the bottom of the image */}
                <div className="relative z-10 w-full px-10 py-12 lg:px-16 lg:py-14">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-5 border border-white/20">
                            <span className="w-1.5 h-1.5 bg-[#DBEAFE] rounded-full" />
                            LibraryHub
                        </span>

                        <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight uppercase mb-5 drop-shadow-sm">
                            Where Every
                            <span className="block">Page Opens</span>
                            <span className="block text-[#DBEAFE]">a New World.</span>
                        </h1>

                        <p className="text-slate-200 text-base leading-relaxed mb-9 max-w-md">
                            Your school library, reimagined. Browse thousands of books,
                            manage borrows, and access digital resources — all from one place.
                        </p>

                        {/* Show CTA buttons only for guests (not logged in) */}
                        {!user && (
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/register"
                                    className="px-8 py-3.5 bg-white text-[#0A2463] font-bold rounded-2xl hover:bg-[#DBEAFE] transition-all shadow-lg flex items-center gap-2 group text-sm"
                                >
                                    Apply for Membership
                                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-sm"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Services ─────────────────────────────────────────── */}
            <section>
                <div className="mb-8">
                    <p className="text-[10px] font-black text-[#0A2463] uppercase tracking-widest mb-2">What We Offer</p>
                    <h2 className="text-3xl font-black text-[#0A2463] uppercase tracking-tight">Our Services</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map(({ icon, title, desc }) => (
                        <div key={title} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-[#DBEAFE] hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-[#DBEAFE] rounded-2xl flex items-center justify-center text-[#0A2463] mb-5 group-hover:bg-[#0A2463] group-hover:text-white transition-all duration-300">
                                {icon}
                            </div>
                            <h3 className="text-sm font-black text-[#0A2463] mb-2 uppercase tracking-tight">{title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner — only for guests, hidden for logged-in users */}
            {!user && (
            <section className="bg-[#0A2463] rounded-3xl px-10 py-12 lg:px-14 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#DBEAFE]/10 rounded-full" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <p className="text-[#DBEAFE] text-[10px] font-black uppercase tracking-widest mb-3">
                            Students &amp; Teachers
                        </p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                            Ready to start<br />reading?
                        </h2>
                        <p className="text-slate-400 mt-3 text-sm max-w-sm leading-relaxed">
                            Apply for your library membership today and get access to our
                            full collection of books and digital resources.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <Link
                            to="/register"
                            className="px-7 py-3.5 bg-white text-[#0A2463] font-bold rounded-2xl hover:bg-[#DBEAFE] transition-all text-sm text-center whitespace-nowrap"
                        >
                            Apply for Membership
                        </Link>
                        <Link
                            to="/login"
                            className="px-7 py-3.5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10 text-sm text-center"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>
            )}

            {/* ── Announcements ────────────────────────────────────── */}
            <section>
                <div className="mb-8">
                    <p className="text-[10px] font-black text-[#0A2463] uppercase tracking-widest mb-2">Stay Updated</p>
                    <h2 className="text-3xl font-black text-[#0A2463] uppercase tracking-tight">Announcements</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                    {announcements.map(({ tag, tagColor, title, date, desc }) => (
                        <div key={title} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-[#DBEAFE] hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${tagColor}`}>
                                    {tag}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">{date}</span>
                            </div>
                            <h3 className="text-sm font-black text-[#0A2463] mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Home;