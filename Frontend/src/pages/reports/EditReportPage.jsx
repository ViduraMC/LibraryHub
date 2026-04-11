// EditReportPage.jsx
// Route: /admin/reports/:id/edit

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getReportById, updateReport } from '../../api/reports.api.js';
import ReportLoadingSpinner from '../../components/ReportLoadingSpinner.jsx';
import BackButton from '../../components/BackButton.jsx';

const EditReportPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        periodStart: '',
        periodEnd: '',
    });

    const [reportType, setReportType] = useState('');
    const [initialForm, setInitialForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await getReportById(id);
                const r = data.report;

                setReportType(r.type || '');

                const toInputDate = (dateStr) =>
                    dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

                const populatedForm = {
                    title: r.title || '',
                    periodStart: toInputDate(r.periodStart),
                    periodEnd: toInputDate(r.periodEnd),
                };

                setForm(populatedForm);
                setInitialForm(populatedForm);
            } catch (err) {
                toast.error('Failed to load report.');
                navigate('/admin/reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const hasUnsavedChanges =
        initialForm &&
        (form.title !== initialForm.title ||
            form.periodStart !== initialForm.periodStart ||
            form.periodEnd !== initialForm.periodEnd);

    const validate = () => {
        const newErrors = {};

        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        };

        const addDays = (date, days) => {
            const result = new Date(date);
            result.setUTCDate(result.getUTCDate() + days);
            return result;
        };

        const addMonths = (date, months) => {
            const result = new Date(date);
            result.setUTCMonth(result.getUTCMonth() + months);
            return result;
        };

        const isSameDate = (a, b) =>
            a?.getUTCFullYear() === b?.getUTCFullYear() &&
            a?.getUTCMonth() === b?.getUTCMonth() &&
            a?.getUTCDate() === b?.getUTCDate();

        if (!form.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!form.periodStart) {
            newErrors.periodStart = 'Period start date is required';
        }

        if (!form.periodEnd) {
            newErrors.periodEnd = 'Period end date is required';
        }

        if (form.periodStart && form.periodEnd) {
            const startDate = parseDate(form.periodStart);
            const endDate = parseDate(form.periodEnd);

            if (startDate >= endDate) {
                newErrors.periodEnd = 'End date must be after the start date';
            } else if (reportType === 'weekly') {
                if (!isSameDate(endDate, addDays(startDate, 7))) {
                    newErrors.periodEnd =
                        'Invalid weekly report dates (must be exactly 7 days)';
                }
            } else if (reportType === 'monthly') {
                if (!isSameDate(endDate, addMonths(startDate, 1))) {
                    newErrors.periodEnd =
                        'Invalid monthly report dates (must be exactly 1 month)';
                }
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);

        try {
            await updateReport(id, form);
            toast.success('Report updated successfully!');
            navigate(`/admin/reports/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update report.');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy transition ${
            errors[field]
                ? 'border-red-300 dark:border-red-400'
                : 'border-slate-200 dark:border-slate-600'
        }`;

    if (loading) {
        return <ReportLoadingSpinner message="Loading report..." />;
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            <div className="max-w-5xl mx-auto">
                <BackButton
                    label="Back to Report"
                    onClick={() => navigate(`/admin/reports/${id}`)}
                />

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-theme-navy dark:text-white">
                        Edit Report
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                        You can only edit the title and period dates. Stats will be recalculated automatically.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-2">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-8 lg:p-10 shadow-sm transition-colors">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-theme-navy dark:text-white">
                                    Report Details
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Update the report title and reporting period.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Report Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className={inputClass('title')}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/60 dark:bg-slate-700/30 transition-colors">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Reporting Period <span className="text-red-400">*</span>
                                        </label>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            Update the reporting range while keeping the report type unchanged.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Period Start
                                            </label>
                                            <input
                                                type="date"
                                                name="periodStart"
                                                value={form.periodStart}
                                                onChange={handleChange}
                                                className={inputClass('periodStart')}
                                            />
                                            {errors.periodStart && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.periodStart}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Period End
                                            </label>
                                            <input
                                                type="date"
                                                name="periodEnd"
                                                value={form.periodEnd}
                                                onChange={handleChange}
                                                className={inputClass('periodEnd')}
                                            />
                                            {errors.periodEnd && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.periodEnd}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (hasUnsavedChanges) {
                                                setShowDiscardModal(true);
                                            } else {
                                                navigate(`/admin/reports/${id}`);
                                            }
                                        }}
                                        className="px-5 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2.5 text-sm bg-theme-navy text-white rounded-xl font-medium hover:bg-blue-900 disabled:opacity-50 transition"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm transition-colors">
                            <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-3">
                                Edit Guidance
                            </h3>

                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                <li>Only the title and reporting period can be changed.</li>
                                <li>Report type remains fixed after creation.</li>
                                <li>Updated dates must still match weekly or monthly rules where applicable.</li>
                                <li>Statistics will be recalculated automatically after saving changes.</li>
                            </ul>
                        </div>

                        <div className="bg-sky-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm transition-colors">
                            <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-2">
                                Quick Note
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Make sure the selected dates remain valid for the existing report type before saving.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showDiscardModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-lg border border-slate-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-lg font-semibold text-theme-navy dark:text-white mb-2">
                            Discard unsaved changes?
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            You have unsaved changes. If you leave now, your edits will be lost.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDiscardModal(false)}
                                className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Continue Editing
                            </button>

                            <button
                                onClick={() => navigate(`/admin/reports/${id}`)}
                                className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditReportPage;