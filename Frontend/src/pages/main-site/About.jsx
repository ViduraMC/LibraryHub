import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const stats = [
    { value: '10,000+', label: 'Books & Resources' },
    { value: '1,500+', label: 'Active Members' },
    { value: '25,000+', label: 'Books Borrowed Yearly' },
    { value: '500+', label: 'Digital Resources' },
];

const values = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        title: 'Knowledge For All',
        desc: 'We believe every student and teacher deserves equal access to quality books and learning resources, regardless of background.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: 'Innovation',
        desc: 'Embracing modern technology to transform the traditional library experience into a seamless, digital-first platform.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'Community',
        desc: 'Building a vibrant reading culture within our school community through shared resources, events, and collaborative learning.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Trust & Responsibility',
        desc: 'Fostering a culture of responsibility where every borrowed book is valued and every resource is treated with care.',
    },
];

const timeline = [
    { year: '2020', title: 'Foundation', desc: 'LibraryHub was conceived as a solution to modernize school library management.' },
    { year: '2022', title: 'Digital Expansion', desc: 'Launched eResources platform, giving students and teachers access to digital journals and e-books.' },
    { year: '2024', title: 'Smart Features', desc: 'Introduced automated borrowing, real-time availability tracking, and the reservation queue system.' },
    { year: '2026', title: 'Full Platform', desc: 'Complete management system with fine tracking, membership workflows, and analytics dashboards.' },
];

const About = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-20 pb-16">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative rounded-3xl overflow-hidden min-h-[420px] flex items-center">
                <img
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80"
                    alt="Grand library interior with bookshelves"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A2463]/95 via-[#0A2463]/80 to-[#0A2463]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2463]/60 to-transparent" />

                <div className="relative z-10 w-full px-10 py-14 lg:px-16">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-5 border border-white/20">
                            <span className="w-1.5 h-1.5 bg-[#DBEAFE] rounded-full" />
                            About LibraryHub
                        </span>

                        <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight uppercase mb-5">
                            Empowering Minds
                            <span className="block text-[#DBEAFE]">Through Books.</span>
                        </h1>

                        <p className="text-slate-200 text-base leading-relaxed max-w-lg">
                            LibraryHub is more than a library management system. It's a gateway
                            to knowledge, connecting students and teachers with the resources
                            they need to learn, grow, and succeed.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ─────────────────────────────────────────── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ value, label }) => (
                    <div key={label} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-[#DBEAFE] dark:hover:border-theme-blue transition-all group">
                        <p className="text-3xl font-black text-[#0A2463] dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-theme-pale transition-colors">{value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{label}</p>
                    </div>
                ))}
            </section>

            {/* ── Mission & Vision ────────────────────────────────── */}
            <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0A2463] rounded-3xl p-8 lg:p-10 relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-[#DBEAFE]/10 rounded-full" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                            <svg className="h-6 w-6 text-[#DBEAFE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-[#DBEAFE] uppercase tracking-widest mb-3">Our Mission</p>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Democratizing Access to Knowledge</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            To provide every student and teacher with seamless, equitable access to books,
                            digital resources, and learning materials, breaking down barriers between
                            curiosity and knowledge through a modern, intuitive library platform.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#DBEAFE]/30 rounded-full" />
                    <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-[#0A2463]/5 rounded-full" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-[#DBEAFE] rounded-2xl flex items-center justify-center mb-5">
                            <svg className="h-6 w-6 text-[#0A2463]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-[#0A2463] dark:text-theme-pale uppercase tracking-widest mb-3">Our Vision</p>
                        <h3 className="text-2xl font-black text-[#0A2463] dark:text-white uppercase tracking-tight mb-4">The Library of Tomorrow</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            To become the leading school library management platform, a place where
                            physical books and digital resources converge, where every borrow is tracked
                            effortlessly, and where the love of reading is cultivated in every student.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Core Values ─────────────────────────────────────── */}
            <section>
                <div className="mb-8">
                    <p className="text-[10px] font-black text-[#0A2463] dark:text-theme-pale uppercase tracking-widest mb-2">What Drives Us</p>
                    <h2 className="text-3xl font-black text-[#0A2463] dark:text-white uppercase tracking-tight">Our Values</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {values.map(({ icon, title, desc }) => (
                        <div key={title} className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:border-[#DBEAFE] dark:hover:border-theme-blue hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-[#DBEAFE] dark:bg-theme-blue/20 rounded-2xl flex items-center justify-center text-[#0A2463] dark:text-theme-pale mb-5 group-hover:bg-[#0A2463] group-hover:text-white transition-all duration-300">
                                {icon}
                            </div>
                            <h3 className="text-sm font-black text-[#0A2463] dark:text-white mb-2 uppercase tracking-tight">{title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Journey Timeline ────────────────────────────────── */}
            <section>
                <div className="mb-8">
                    <p className="text-[10px] font-black text-[#0A2463] dark:text-theme-pale uppercase tracking-widest mb-2">Our Story</p>
                    <h2 className="text-3xl font-black text-[#0A2463] dark:text-white uppercase tracking-tight">The Journey</h2>
                </div>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />

                    <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-10">
                        {timeline.map(({ year, title, desc }, i) => (
                            <div
                                key={year}
                                className={`relative ${i % 2 === 0 ? 'md:text-right md:pr-8' : 'md:col-start-2 md:pl-8'}`}
                            >
                                {/* Dot on timeline */}
                                <div className="hidden md:flex absolute top-1 w-5 h-5 bg-[#DBEAFE] border-4 border-white rounded-full shadow-sm z-10"
                                    style={i % 2 === 0
                                        ? { right: '-2.15rem' }
                                        : { left: '-2.15rem' }
                                    }
                                />

                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#DBEAFE] dark:hover:border-theme-blue transition-all">
                                    <span className="text-[10px] font-black text-theme-blue dark:text-theme-pale uppercase tracking-widest">{year}</span>
                                    <h4 className="text-sm font-black text-[#0A2463] dark:text-white uppercase tracking-tight mt-1 mb-2">{title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Behind the scenes ──────────────────────────────── */}
            <section className="grid md:grid-cols-2 gap-6 items-center">
                <div className="rounded-3xl overflow-hidden h-72 md:h-full min-h-[300px]">
                    <img
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
                        alt="Stack of colorful books"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                </div>
                <div className="space-y-5">
                    <p className="text-[10px] font-black text-[#0A2463] dark:text-theme-pale uppercase tracking-widest">Built With Purpose</p>
                    <h2 className="text-3xl font-black text-[#0A2463] dark:text-white uppercase tracking-tight leading-tight">
                        A System Designed<br />For Real Schools
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        LibraryHub was born out of a real need: managing thousands of books,
                        hundreds of members, and countless daily transactions in a school
                        library is complex. Pen-and-paper systems and basic spreadsheets
                        simply can't keep up.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        We built LibraryHub to solve this. From automated borrowing workflows
                        and smart reservation queues to fine management and detailed analytics,
                        every feature is designed with librarians, students, and teachers in mind.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <span className="px-4 py-2 bg-[#DBEAFE] text-[#0A2463] text-[10px] font-black uppercase tracking-widest rounded-full">Smart Borrowing</span>
                        <span className="px-4 py-2 bg-[#DBEAFE] text-[#0A2463] text-[10px] font-black uppercase tracking-widest rounded-full">Fine Tracking</span>
                        <span className="px-4 py-2 bg-[#DBEAFE] text-[#0A2463] text-[10px] font-black uppercase tracking-widest rounded-full">CSV Imports</span>
                        <span className="px-4 py-2 bg-[#DBEAFE] text-[#0A2463] text-[10px] font-black uppercase tracking-widest rounded-full">eResources</span>
                        <span className="px-4 py-2 bg-[#DBEAFE] text-[#0A2463] text-[10px] font-black uppercase tracking-widest rounded-full">Reservations</span>
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────── */}
            {!user && (
                <section className="bg-[#0A2463] rounded-3xl px-10 py-14 lg:px-16 relative overflow-hidden text-center">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#DBEAFE]/10 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full" />

                    <div className="relative z-10 max-w-xl mx-auto">
                        <p className="text-[#DBEAFE] text-[10px] font-black uppercase tracking-widest mb-4">
                            Join Our Community
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                            Ready to Start<br />Your Reading Journey?
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                            Apply for your library membership today and unlock access to our full
                            collection of books, digital resources, and exclusive features.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-3.5 bg-white text-[#0A2463] font-bold rounded-2xl hover:bg-[#DBEAFE] transition-all shadow-lg text-sm flex items-center gap-2 group"
                            >
                                Apply for Membership
                                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-sm"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default About;