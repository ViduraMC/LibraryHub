import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllLibrarians, getStudentList, getTeacherList } from '../../api/admin.api.js';
import { getMembershipRequests } from '../../api/membership.api.js';

/**
 * Admin Dashboard — system overview with stats, distribution chart, and recent activity.
 * Follows 60-30-10 color theme: White 60%, Pale Blue (#DBEAFE) 30%, Navy (#0A2463) 10%.
 */
const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        librarians: null,
        students: null,
        teachers: null,
        pendingRequests: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [libRes, stuRes, tchRes, reqRes] = await Promise.allSettled([
                    getAllLibrarians(),
                    getStudentList(),
                    getTeacherList(),
                    getMembershipRequests({ status: 'verified' }),
                ]);

                setStats({
                    librarians: libRes.status === 'fulfilled' ? libRes.value.data.librarians?.length ?? 0 : '—',
                    students:   stuRes.status === 'fulfilled' ? stuRes.value.data.students?.length ?? 0 : '—',
                    teachers:   tchRes.status === 'fulfilled' ? tchRes.value.data.teachers?.length ?? 0 : '—',
                    pendingRequests: reqRes.status === 'fulfilled' ? reqRes.value.data.requests?.length ?? 0 : '—',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Librarians',
            value: stats.librarians,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            link: '/admin/librarians',
            accent: 'bg-theme-navy',
            iconBg: 'bg-theme-navy/10 text-theme-navy',
        },
        {
            label: 'Students on Register',
            value: stats.students,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            link: '/admin/school-lists',
            accent: 'bg-theme-blue',
            iconBg: 'bg-theme-blue/10 text-theme-blue',
        },
        {
            label: 'Teachers on Register',
            value: stats.teachers,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            link: '/admin/school-lists',
            accent: 'bg-theme-blue',
            iconBg: 'bg-theme-pale text-theme-blue',
        },
        {
            label: 'Pending Approvals',
            value: stats.pendingRequests,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            link: null,
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-50 text-amber-600',
        },
    ];

    // Calculate max for bar chart scale
    const totalMembers = (typeof stats.students === 'number' ? stats.students : 0) +
                         (typeof stats.teachers === 'number' ? stats.teachers : 0);
    const maxBar = Math.max(totalMembers, 1);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                    Dashboard
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    System overview — monitor librarians, membership registers, and approvals.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map(({ label, value, icon, link, accent, iconBg }) => (
                    <div
                        key={label}
                        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        {/* Top accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />

                        <div className="flex items-start justify-between mb-3 pt-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                                {icon}
                            </div>
                            {link && (
                                <Link
                                    to={link}
                                    className="text-[10px] font-bold text-theme-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    View →
                                </Link>
                            )}
                        </div>

                        <p className={`text-4xl font-black ${loading ? 'text-slate-200 animate-pulse' : 'text-theme-navy'} mb-1`}>
                            {loading ? '—' : value}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Distribution + Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Membership Distribution Chart */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-black text-theme-navy uppercase tracking-widest mb-5">
                        Membership Distribution
                    </h2>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 bg-slate-50 rounded-lg" />
                            <div className="h-8 bg-slate-50 rounded-lg" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Students bar */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-600">Students</span>
                                    <span className="text-xs font-black text-theme-navy">{stats.students}</span>
                                </div>
                                <div className="h-8 bg-theme-pale/50 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-theme-blue rounded-lg transition-all duration-700 ease-out flex items-center pl-3"
                                        style={{ width: `${Math.max((stats.students / maxBar) * 100, 2)}%` }}
                                    >
                                        {stats.students > 0 && (
                                            <span className="text-[10px] font-bold text-white">
                                                {Math.round((stats.students / totalMembers) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Teachers bar */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-600">Teachers</span>
                                    <span className="text-xs font-black text-theme-navy">{stats.teachers}</span>
                                </div>
                                <div className="h-8 bg-theme-pale/50 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-theme-navy rounded-lg transition-all duration-700 ease-out flex items-center pl-3"
                                        style={{ width: `${Math.max((stats.teachers / maxBar) * 100, 2)}%` }}
                                    >
                                        {stats.teachers > 0 && (
                                            <span className="text-[10px] font-bold text-white">
                                                {Math.round((stats.teachers / totalMembers) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Librarians bar */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-600">Librarians</span>
                                    <span className="text-xs font-black text-theme-navy">{stats.librarians}</span>
                                </div>
                                <div className="h-8 bg-theme-pale/50 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-slate-500 rounded-lg transition-all duration-700 ease-out flex items-center pl-3"
                                        style={{ width: `${Math.max((stats.librarians / maxBar) * 100, 2)}%` }}
                                    >
                                        {stats.librarians > 0 && (
                                            <span className="text-[10px] font-bold text-white">{stats.librarians}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Total on Register</span>
                                <span className="text-lg font-black text-theme-navy">{totalMembers}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* System Summary */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-black text-theme-navy uppercase tracking-widest mb-5">
                        System Summary
                    </h2>

                    <div className="space-y-3">
                        <SummaryRow
                            label="Active Librarians"
                            value={loading ? '—' : stats.librarians}
                            link="/admin/librarians"
                            color="text-theme-navy"
                        />
                        <SummaryRow
                            label="Students on Register"
                            value={loading ? '—' : stats.students}
                            link="/admin/school-lists"
                            color="text-theme-blue"
                        />
                        <SummaryRow
                            label="Teachers on Register"
                            value={loading ? '—' : stats.teachers}
                            link="/admin/school-lists"
                            color="text-theme-blue"
                        />
                        <SummaryRow
                            label="Pending Membership Approvals"
                            value={loading ? '—' : stats.pendingRequests}
                            link={null}
                            color="text-amber-600"
                            highlight={typeof stats.pendingRequests === 'number' && stats.pendingRequests > 0}
                        />
                    </div>

                    {/* Manage links */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        <Link
                            to="/admin/librarians"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-navy bg-theme-pale px-4 py-2 rounded-lg hover:bg-theme-pale/70 transition-all"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Manage Librarians
                        </Link>
                        <Link
                            to="/admin/school-lists"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-navy bg-theme-pale px-4 py-2 rounded-lg hover:bg-theme-pale/70 transition-all"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            School Lists
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable summary row component
const SummaryRow = ({ label, value, link, color, highlight }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl ${highlight ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50/50'}`}>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="flex items-center gap-3">
            <span className={`text-lg font-black ${color}`}>{value}</span>
            {link && (
                <Link to={link} className="text-[10px] font-bold text-theme-blue hover:underline">
                    View →
                </Link>
            )}
        </div>
    </div>
);

export default AdminDashboardPage;
