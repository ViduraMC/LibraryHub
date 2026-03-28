// ReportHoverPreview.jsx
// Small floating preview card that appears when hovering over a report title

import { formatDate, formatType, getTypeBadgeClass } from '../utils/reportHelpers.js';

const ReportHoverPreview = ({ report }) => {
    return (
        <div
            className="absolute left-full top-0 ml-3 z-50 w-64"
            onMouseEnter={(e) => e.stopPropagation()}
        >
            <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 transition-colors">
                <div className="absolute -left-2 top-4 w-3 h-3 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 rotate-45" />

                <p className="text-sm font-bold text-theme-navy dark:text-white mb-3 leading-tight">
                    {report.title}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-700 mb-3" />

                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Type</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeClass(
                                report.type
                            )}`}
                        >
                            {formatType(report.type)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Period</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-right">
                            {formatDate(report.periodStart)} → {formatDate(report.periodEnd)}
                        </span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Total Books</span>
                        <span className="text-xs font-bold text-theme-navy dark:text-white">
                            {report.totalBooks ?? '—'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Lost Books</span>
                        <span className="text-xs font-bold text-red-500 dark:text-red-400">
                            {report.lostBooks ?? '—'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500">New Users</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                            {report.totalNewUsers ?? '—'}
                        </span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                    <div className="flex gap-2 justify-end pt-1 flex-wrap">
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                report.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                            }`}
                        >
                            {report.status === 'active' ? 'Active' : 'Archived'}
                        </span>

                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                report.isFinalized
                                    ? 'bg-theme-pale text-theme-navy border border-blue-200 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
                            }`}
                        >
                            {report.isFinalized ? 'Finalized' : 'Draft'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportHoverPreview;