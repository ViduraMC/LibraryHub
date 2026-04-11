// ArchivedReportsPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getReports,
    restoreReport,
    permanentlyDeleteReport,
    downloadReport,
} from '../../api/reports.api.js';
import ReportCard from '../../components/ReportCard.jsx';
import ReportFilterPanel from '../../components/ReportFilterPanel.jsx';
import ReportLoadingSpinner from '../../components/ReportLoadingSpinner.jsx';
import ReportModalConfirm from '../../components/ReportModalConfirm.jsx';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import BackButton from '../../components/BackButton.jsx';

const ITEMS_PER_PAGE = 6;

const ArchivedReportsPage = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState({
        open: false,
        report: null,
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchArchived = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getReports(true);
                setReports(data.reports);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load archived reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchArchived();
    }, []);

    const filtered = useMemo(() => {
        return reports.filter((r) => {
            const matchSearch = (r.title || '')
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchType = typeFilter ? r.type === typeFilter : true;

            const matchStatus =
                statusFilter === 'draft'
                    ? !r.isFinalized
                    : statusFilter === 'finalized'
                    ? r.isFinalized
                    : true;

            const matchFrom = dateFrom
                ? new Date(r.periodStart) >= new Date(dateFrom)
                : true;

            const matchTo = dateTo
                ? new Date(r.periodEnd) <= new Date(dateTo)
                : true;

            return matchSearch && matchType && matchStatus && matchFrom && matchTo;
        });
    }, [reports, search, typeFilter, statusFilter, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
        if (filtered.length === 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages, filtered.length]);

    const handleRestore = async (report) => {
        try {
            await restoreReport(report._id);
            setReports((prev) => prev.filter((r) => r._id !== report._id));
            toast.success('Report restored successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to restore.');
        }
    };

    const handlePermanentDelete = (report) => {
        setModal({ open: true, report });
    };

    const confirmPermanentDelete = async () => {
        setActionLoading(true);

        try {
            await permanentlyDeleteReport(modal.report._id);
            setReports((prev) => prev.filter((r) => r._id !== modal.report._id));
            toast.success('Report permanently deleted.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, report: null });
        }
    };

    const handleDownload = async (report) => {
        try {
            await downloadReport(report._id, report.title);
            toast.success('Download started!');
        } catch {
            toast.error('Failed to download.');
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            <ReportModalConfirm
                isOpen={modal.open}
                title="Permanently Delete Report"
                message="This will permanently delete the report and cannot be undone. Are you sure?"
                confirmLabel="Yes, Delete Permanently"
                confirmStyle="danger"
                onConfirm={confirmPermanentDelete}
                onCancel={() => setModal({ open: false, report: null })}
                isLoading={actionLoading}
            />

            <BackButton
                label="Back to Reports"
                onClick={() => navigate('/admin/reports')}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white uppercase tracking-tight">
                        Archived Reports
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Restore or permanently delete archived reports.
                    </p>
                </div>
            </div>

            {!loading && !error && (
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                        {filtered.length} archived report{filtered.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            )}

            {/* Filters wrapper (light fix only) */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-8 transition-colors">
                <ReportFilterPanel
                    search={search}
                    onSearch={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                    typeFilter={typeFilter}
                    onTypeFilter={(value) => {
                        setTypeFilter(value);
                        setCurrentPage(1);
                    }}
                    statusFilter={statusFilter}
                    onStatusFilter={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}
                    dateFrom={dateFrom}
                    onDateFrom={(value) => {
                        setDateFrom(value);
                        setCurrentPage(1);
                    }}
                    dateTo={dateTo}
                    onDateTo={(value) => {
                        setDateTo(value);
                        setCurrentPage(1);
                    }}
                    onReset={handleResetFilters}
                />
            </div>

            {loading ? (
                <ReportLoadingSpinner message="Loading archived reports..." />
            ) : error ? (
                <div className="text-center py-16">
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/admin/reports')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-theme-navy text-theme-navy dark:text-white dark:border-slate-500 text-sm rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700 transition-colors"
                    >
                        Back to Reports
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-center py-16 px-6 transition-colors">
                    <ArchiveBoxIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                        {reports.length === 0
                            ? 'No archived reports available.'
                            : 'No archived reports match the selected filters.'}
                    </p>

                    <button
                        onClick={
                            reports.length === 0
                                ? () => navigate('/admin/reports')
                                : handleResetFilters
                        }
                        className="mt-4 px-4 py-2 border border-theme-navy text-theme-navy dark:text-white dark:border-slate-500 text-sm rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700 transition-colors"
                    >
                        {reports.length === 0
                            ? 'Back to Active Reports'
                            : 'Reset Filters'}
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {paginated.map((report) => (
                            <ReportCard
                                key={report._id}
                                report={report}
                                onRestore={handleRestore}
                                onPermanentDelete={handlePermanentDelete}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${
                                        currentPage === page
                                            ? 'bg-theme-navy text-white'
                                            : 'border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ArchivedReportsPage;