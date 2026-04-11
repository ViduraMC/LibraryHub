import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getReportById,
    finalizeReport,
    deleteReport,
    restoreReport,
    permanentlyDeleteReport,
    downloadReport,
} from '../../api/reports.api.js';
import ReportTable from '../../components/ReportTable.jsx';
import ReportActionButtons from '../../components/ReportActionButtons.jsx';
import ReportLoadingSpinner from '../../components/ReportLoadingSpinner.jsx';
import ReportModalConfirm from '../../components/ReportModalConfirm.jsx';
import ReportTimeline from '../../components/ReportTimeline.jsx';
import BackButton from '../../components/BackButton.jsx';

const ReportDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ open: false, type: null });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getReportById(id);
                setReport(data.report);
            } catch (err) {
                setError(err.response?.data?.message || 'Report not found.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const enhancedReport = report
        ? {
              ...report,
              netBooks: (report.totalBooks || 0) - (report.lostBooks || 0),
          }
        : null;

    const handleFinalize = async () => {
        setActionLoading(true);
        try {
            const data = await finalizeReport(id);
            setReport(data.report);
            toast.success('Report finalized successfully!');
        } catch {
            toast.error('Failed to finalize.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null });
        }
    };

    const handleArchive = async () => {
        setActionLoading(true);
        try {
            await deleteReport(id);
            toast.success('Report archived.');
            navigate('/admin/reports');
        } catch {
            toast.error('Failed to archive.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null });
        }
    };

    const handleRestore = async () => {
        setActionLoading(true);
        try {
            const data = await restoreReport(id);
            setReport(data.report);
            toast.success('Report restored.');
        } catch {
            toast.error('Failed to restore.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null });
        }
    };

    const handlePermanentDelete = async () => {
        setActionLoading(true);
        try {
            await permanentlyDeleteReport(id);
            toast.success('Report permanently deleted.');
            navigate('/admin/reports/archived');
        } catch {
            toast.error('Failed to delete.');
        } finally {
            setActionLoading(false);
            setModal({ open: false, type: null });
        }
    };

    const handleDownload = async () => {
        try {
            await downloadReport(id, report.title);
            toast.success('Download started!');
        } catch {
            toast.error('Failed to download.');
        }
    };

    const modalConfig = {
        finalize: {
            title: 'Finalize Report',
            message: 'Finalize this report?',
            confirmLabel: 'Yes, Finalize',
            confirmStyle: 'primary',
            onConfirm: handleFinalize,
        },
        archive: {
            title: 'Archive Report',
            message: 'Move this report to archive?',
            confirmLabel: 'Archive',
            confirmStyle: 'warning',
            onConfirm: handleArchive,
        },
        permanentDelete: {
            title: 'Delete Report',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
            confirmStyle: 'danger',
            onConfirm: handlePermanentDelete,
        },
    };

    const activeModal = modal.type ? modalConfig[modal.type] : null;

    if (loading) return <ReportLoadingSpinner message="Loading report..." />;

    if (error) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-center py-20 px-6">
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/admin/reports')}
                        className="px-4 py-2 border border-theme-navy text-theme-navy dark:text-white dark:border-slate-500 rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700"
                    >
                        Back to Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            {activeModal && (
                <ReportModalConfirm
                    isOpen={modal.open}
                    {...activeModal}
                    onCancel={() => setModal({ open: false, type: null })}
                    isLoading={actionLoading}
                />
            )}

            <BackButton
                label="Back to Reports"
                onClick={() => navigate('/admin/reports')}
            />

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-6 transition-colors">
                <div className="flex justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-theme-navy dark:text-white">
                            {enhancedReport?.title || 'Untitled Report'}
                        </h1>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            Report ID: {enhancedReport?._id}
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <ReportActionButtons
                            report={enhancedReport}
                            onFinalize={() => setModal({ open: true, type: 'finalize' })}
                            onEdit={() => navigate(`/admin/reports/${id}/edit`)}
                            onArchive={() => setModal({ open: true, type: 'archive' })}
                            onRestore={handleRestore}
                            onPermanentDelete={() =>
                                setModal({ open: true, type: 'permanentDelete' })
                            }
                            onDownload={handleDownload}
                        />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-6">
                <ReportTimeline report={enhancedReport} />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-6">
                <ReportTable report={enhancedReport} />
            </div>
        </div>
    );
};

export default ReportDetailsPage;