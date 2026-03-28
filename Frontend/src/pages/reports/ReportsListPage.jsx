// ReportsListPage.jsx
// Route: /admin/reports

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getReports,
    finalizeReport,
    deleteReport,
    restoreReport,
    permanentlyDeleteReport,
    downloadReport,
} from '../../api/reports.api.js';
import ReportCard from '../../components/ReportCard.jsx';
import ReportFilterPanel from '../../components/ReportFilterPanel.jsx';
import ReportLoadingSpinner from '../../components/ReportLoadingSpinner.jsx';
import ReportModalConfirm from '../../components/ReportModalConfirm.jsx';
import {
    ChartBarIcon,
    ArchiveBoxIcon,
    DocumentPlusIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 6;

const ReportsListPage = () => {
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
        type: null,
        report: null,
    });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getReports(false);
            setReports(data.reports);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        setCurrentPage(1);
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

            return (
                matchSearch &&
                matchType &&
                matchStatus &&
                matchFrom &&
                matchTo
            );
        });
    }, [reports, search, typeFilter, statusFilter, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const allActive = reports.filter((r) => r.status === 'active').length;
    const allFinalized = reports.filter((r) => r.isFinalized).length;
    const allDraft = reports.filter((r) => !r.isFinalized).length;

    const handleFinalize = (report) =>
        setModal({ open: true, type: 'finalize', report });

    const confirmFinalize = async () => {
        setActionLoading(true);
        try {
            const data = await finalizeReport(modal.report._id);
            setReports((prev) =>
                prev.map((r) => (r._id === modal.report._id ? data.report : r))
            );
            toast.success('Report finalized successfully!');
        } catch {
            toast.error('Failed to finalize.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null, report: null });
        }
    };

    const handleArchive = (report) =>
        setModal({ open: true, type: 'archive', report });

    const confirmArchive = async () => {
        setActionLoading(true);
        try {
            await deleteReport(modal.report._id);
            setReports((prev) => prev.filter((r) => r._id !== modal.report._id));
            toast.success('Report archived successfully!');
        } catch {
            toast.error('Failed to archive.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null, report: null });
        }
    };

    const handleRestore = async (report) => {
        try {
            await restoreReport(report._id);
            setReports((prev) => prev.filter((r) => r._id !== report._id));
            toast.success('Report restored successfully!');
        } catch {
            toast.error('Failed to restore.');
        }
    };

    const handlePermanentDelete = (report) =>
        setModal({ open: true, type: 'permanentDelete', report });

    const confirmPermanentDelete = async () => {
        setActionLoading(true);
        try {
            await permanentlyDeleteReport(modal.report._id);
            setReports((prev) => prev.filter((r) => r._id !== modal.report._id));
            toast.success('Report permanently deleted.');
        } catch {
            toast.error('Failed to delete.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null, report: null });
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

    const handleEdit = (report) =>
        navigate(`/admin/reports/${report._id}/edit`);

    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    const modalConfig = {
        finalize: {
            title: 'Finalize Report',
            message: 'Are you sure?',
            confirmLabel: 'Yes, Finalize',
            confirmStyle: 'primary',
            onConfirm: confirmFinalize,
        },
        archive: {
            title: 'Archive Report',
            message: 'Are you sure?',
            confirmLabel: 'Yes, Archive',
            confirmStyle: 'warning',
            onConfirm: confirmArchive,
        },
        permanentDelete: {
            title: 'Delete Report',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
            confirmStyle: 'danger',
            onConfirm: confirmPermanentDelete,
        },
    };

    const activeModal = modal.type ? modalConfig[modal.type] : null;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            {activeModal && (
                <ReportModalConfirm
                    isOpen={modal.open}
                    {...activeModal}
                    onCancel={() => setModal({ open: false, type: null, report: null })}
                    isLoading={actionLoading}
                />
            )}

            {/* Header */}
            <div className="flex justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white uppercase">
                        Reports
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage and review all library reports
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/admin/reports/analysis')}
                        className="px-4 py-2 bg-theme-pale dark:bg-slate-700 text-theme-navy dark:text-white rounded-lg">
                        <ChartBarIcon className="w-4 h-4 inline mr-1"/> Analysis
                    </button>

                    <button onClick={() => navigate('/admin/reports/archived')}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg">
                        <ArchiveBoxIcon className="w-4 h-4 inline mr-1"/> Archived
                    </button>

                    <button onClick={() => navigate('/admin/reports/create')}
                        className="px-4 py-2 bg-theme-navy text-white rounded-lg">
                        <DocumentPlusIcon className="w-4 h-4 inline mr-1"/> New
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-5 mb-8">
                <ReportFilterPanel {...{
                    search, typeFilter, statusFilter, dateFrom, dateTo,
                    onSearch: setSearch,
                    onTypeFilter: setTypeFilter,
                    onStatusFilter: setStatusFilter,
                    onDateFrom: setDateFrom,
                    onDateTo: setDateTo,
                    onReset: handleResetFilters
                }}/>
            </div>

            {/* Content */}
            {loading ? (
                <ReportLoadingSpinner />
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto"/>
                    <p className="text-slate-400 dark:text-slate-500 mt-2">
                        No reports found
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginated.map((report) => (
                        <ReportCard key={report._id} report={report}
                            onFinalize={handleFinalize}
                            onEdit={handleEdit}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onPermanentDelete={handlePermanentDelete}
                            onDownload={handleDownload}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsListPage;