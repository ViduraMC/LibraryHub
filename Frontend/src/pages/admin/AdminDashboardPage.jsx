import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllLibrarians } from '../../api/admin.api.js';
import { getMembershipRequests } from '../../api/membership.api.js';
import { getStudentList, getTeacherList } from '../../api/admin.api.js';

/**
 * Admin landing dashboard — shows quick-glance stats and links to management areas.
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

    const cards = [
        {
            label: 'Librarians',
            value: stats.librarians,
            color: 'bg-theme-navy',
            link: '/admin/librarians',
            linkLabel: 'Manage Librarians',
        },
        {
            label: 'Students on Register',
            value: stats.students,
            color: 'bg-theme-blue',
            link: '/admin/school-lists',
            linkLabel: 'View School Lists',
        },
        {
            label: 'Teachers on Register',
            value: stats.teachers,
            color: 'bg-slate-700',
            link: '/admin/school-lists',
            linkLabel: 'View School Lists',
        },
        {
            label: 'Pending Membership Approvals',
            value: stats.pendingRequests,
            color: 'bg-amber-500',
            link: null,
            linkLabel: null,
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                    Admin Dashboard
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    System-wide overview. Manage librarians, upload school lists, and monitor membership activity.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(({ label, value, color, link, linkLabel }) => (
                    <div
                        key={label}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            {label}
                        </p>
                        <p className={`text-5xl font-black ${loading ? 'text-slate-200 animate-pulse' : 'text-theme-navy'} mb-4`}>
                            {loading ? '—' : value}
                        </p>
                        {link && (
                            <Link
                                to={link}
                                className={`inline-block text-xs font-bold text-white ${color} px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}
                            >
                                {linkLabel} →
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-700 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { to: '/admin/librarians', icon: '👤', title: 'Add Librarian', desc: 'Create a new librarian account' },
                        { to: '/admin/school-lists', icon: '📋', title: 'Upload School List', desc: 'Import student or teacher CSV' },
                        { to: '/admin/school-lists', icon: '🔍', title: 'View School Lists', desc: 'Browse registered students & teachers' },
                    ].map(({ to, icon, title, desc }) => (
                        <Link
                            key={title}
                            to={to}
                            className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-theme-blue/30 hover:shadow-sm transition-all group"
                        >
                            <span className="text-2xl">{icon}</span>
                            <div>
                                <p className="font-bold text-slate-800 group-hover:text-theme-blue transition-colors">
                                    {title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
