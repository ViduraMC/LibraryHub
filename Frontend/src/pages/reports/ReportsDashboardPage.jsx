// ReportsDashboardPage.jsx
// Route: /admin/reports/analysis
// Professional analysis page with clean charts

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getReports } from '../../api/reports.api.js';
import ReportLoadingSpinner from '../../components/ReportLoadingSpinner.jsx';
import BackButton from '../../components/BackButton.jsx';
import { formatDate } from '../../utils/reportHelpers.js';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// ── Theme colors ──────────────────────────────
const NAVY = '#0A2463';
const SKY = '#0EA5E9';

const ReportsDashboardPage = () => {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Filters ────────────────────────────────
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // ── Fetch all reports ──────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [activeData, archivedData] = await Promise.all([
                    getReports(false),
                    getReports(true),
                ]);

                setAllReports([
                    ...(activeData?.reports || []),
                    ...(archivedData?.reports || []),
                ]);
            } catch {
                toast.error('Failed to load analysis data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // ── Apply filters ──────────────────────────
    const filtered = allReports.filter((r) => {
        const matchType = typeFilter ? r.type === typeFilter : true;
        const matchFrom = dateFrom
            ? new Date(r.periodStart) >= new Date(dateFrom)
            : true;
        const matchTo = dateTo
            ? new Date(r.periodEnd) <= new Date(dateTo)
            : true;

        return matchType && matchFrom && matchTo;
    });

    // ── Chart 1: Reports by Type (Bar) ─────────
    const typeChartData = ['weekly', 'monthly', 'custom'].map((type) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: filtered.filter((r) => r.type === type).length,
    }));

    // ── Chart 2: Draft vs Finalized (Donut) ────
    const finalizedCount = filtered.filter((r) => r.isFinalized).length;
    const draftCount = filtered.filter((r) => !r.isFinalized).length;

    const statusDonutData = [
        { name: 'Finalized', value: finalizedCount },
        { name: 'Draft', value: draftCount },
    ];

    const STATUS_COLORS = [NAVY, SKY];

    // ── Chart 3: Total Books vs Lost Books ─────
    const booksChartData = [...filtered]
        .sort((a, b) => new Date(a.periodStart) - new Date(b.periodStart))
        .slice(0, 8)
        .map((r) => ({
            name: r.title.length > 12 ? `${r.title.slice(0, 12)}…` : r.title,
            Total: r.totalBooks ?? 0,
            Lost: r.lostBooks ?? 0,
        }));

    // ── Chart 4: New Users over time ───────────
    const usersChartData = [...filtered]
        .sort((a, b) => new Date(a.periodStart) - new Date(b.periodStart))
        .slice(0, 8)
        .map((r) => ({
            date: formatDate(r.periodStart),
            'New Users': r.totalNewUsers ?? 0,
        }));

    // ── Summary cards ──────────────────────────
    const totalBooks = filtered.reduce((sum, r) => sum + (r.totalBooks ?? 0), 0);
    const totalLost = filtered.reduce((sum, r) => sum + (r.lostBooks ?? 0), 0);
    const totalUsers = filtered.reduce((sum, r) => sum + (r.totalNewUsers ?? 0), 0);
    const totalNetBooks = totalBooks - totalLost;

    const summaryCards = [
        {
            label: 'Reports Analysed',
            value: filtered.length,
            text: 'text-theme-navy dark:text-white',
            bg: 'bg-[rgba(10,36,99,0.06)] dark:bg-slate-800',
            border: 'border-l-[4px] border-theme-navy',
        },
        {
            label: 'Total Books',
            value: totalBooks,
            text: 'text-theme-blue dark:text-theme-pale',
            bg: 'bg-[rgba(30,63,160,0.06)] dark:bg-slate-800',
            border: 'border-l-[4px] border-theme-blue',
        },
        {
            label: 'Net Books',
            value: totalNetBooks,
            text: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-[rgba(99,102,241,0.08)] dark:bg-slate-800',
            border: 'border-l-[4px] border-indigo-500',
        },
        {
            label: 'Lost Books',
            value: totalLost,
            text: 'text-red-500 dark:text-red-400',
            bg: 'bg-[rgba(239,68,68,0.08)] dark:bg-slate-800',
            border: 'border-l-[4px] border-red-500',
        },
        {
            label: 'New Users',
            value: totalUsers,
            text: 'text-green-600 dark:text-green-400',
            bg: 'bg-[rgba(16,185,129,0.08)] dark:bg-slate-800',
            border: 'border-l-[4px] border-green-500',
        },
    ];

    if (loading) {
        return <ReportLoadingSpinner message="Loading analysis..." />;
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            <BackButton
                label="Back to Reports"
                onClick={() => navigate('/admin/reports')}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white tracking-tight uppercase">
                        Reports
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Visual breakdown of report trends, status, and library activity
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-8 flex flex-wrap gap-4 items-end transition-colors">
                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Type
                    </label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    >
                        <option value="">All Types</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    />
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    />
                </div>

                <button
                    onClick={() => {
                        setTypeFilter('');
                        setDateFrom('');
                        setDateTo('');
                    }}
                    className="px-4 py-2 text-sm text-theme-navy dark:text-white border border-theme-navy dark:border-slate-500 rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700 transition-colors h-[42px]"
                >
                    Reset
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                {summaryCards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-2xl px-5 py-4 text-center shadow-sm border border-slate-100 dark:border-slate-700 ${card.bg} ${card.border} transition-colors`}
                    >
                        <p className={`text-3xl font-bold ${card.text}`}>
                            {card.value}
                        </p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide">
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <ChartBarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                        No data available for the selected filters.
                    </p>
                    <button
                        onClick={() => {
                            setTypeFilter('');
                            setDateFrom('');
                            setDateTo('');
                        }}
                        className="mt-4 px-4 py-2 border border-theme-navy dark:border-slate-500 text-theme-navy dark:text-white text-sm rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-1 uppercase tracking-wide">
                            Reports by Type
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                            How many reports exist per type
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={typeChartData}
                                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="type"
                                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#1E3FA0"
                                    radius={[6, 6, 0, 0]}
                                    label={{ position: 'top', fontSize: 11, fill: '#64748B' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-1 uppercase tracking-wide">
                            Draft vs Finalized
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                            Ratio of finalized to draft reports
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusDonutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {statusDonutData.map((_, index) => (
                                        <Cell key={index} fill={STATUS_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 10,
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: '#0f172a',
                                        color: '#fff',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-1 uppercase tracking-wide">
                            Total Books vs Lost Books
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                            Comparison across report periods
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={booksChartData}
                                margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                <Bar dataKey="Total" fill="#1E3FA0" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Lost" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-1 uppercase tracking-wide">
                            New Users Over Time
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                            User growth trend across report periods
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart
                                data={usersChartData}
                                margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="New Users"
                                    stroke="#1E3FA0"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#1E3FA0' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsDashboardPage;