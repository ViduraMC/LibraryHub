import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createReport } from '../../api/reports.api.js';
import BackButton from '../../components/BackButton.jsx';

const CreateReportPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        type: '',
        periodStart: '',
        periodEnd: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(Date.UTC(y, m - 1, d));
        };

        const addDays = (date, days) => {
            const r = new Date(date);
            r.setUTCDate(r.getUTCDate() + days);
            return r;
        };

        const addMonths = (date, months) => {
            const r = new Date(date);
            r.setUTCMonth(r.getUTCMonth() + months);
            return r;
        };

        const isSameDate = (a, b) =>
            a?.getUTCFullYear() === b?.getUTCFullYear() &&
            a?.getUTCMonth() === b?.getUTCMonth() &&
            a?.getUTCDate() === b?.getUTCDate();

        if (!form.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!form.type) {
            newErrors.type = 'Please select a report type';
        }

        if (!form.periodStart) {
            newErrors.periodStart = 'Period start date is required';
        }

        if (!form.periodEnd) {
            newErrors.periodEnd = 'Period end date is required';
        }

        if (form.periodStart && form.periodEnd) {
            const start = parseDate(form.periodStart);
            const end = parseDate(form.periodEnd);

            if (start >= end) {
                newErrors.periodEnd = 'End date must be after the start date';
            } else if (form.type === 'weekly') {
                if (!isSameDate(end, addDays(start, 7))) {
                    newErrors.periodEnd =
                        'Invalid weekly report dates (must be exactly 7 days)';
                }
            } else if (form.type === 'monthly') {
                if (!isSameDate(end, addMonths(start, 1))) {
                    newErrors.periodEnd =
                        'Invalid monthly report dates (must be exactly 1 month)';
                }
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);

        try {
            const data = await createReport(form);
            toast.success('Report created successfully!');
            navigate(`/admin/reports/${data.report._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create report.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy transition ${
            errors[field]
                ? 'border-red-300 dark:border-red-400'
                : 'border-slate-200 dark:border-slate-600'
        }`;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 transition-colors">
            <div className="max-w-7xl mx-auto">
                <BackButton
                    label="Back to Reports"
                    onClick={() => navigate('/admin/reports')}
                />

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white uppercase tracking-tight">
                        Create Report
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                        Set up the report title, type, and reporting period.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    {/* FORM */}
                    <div className="xl:col-span-2">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-8 shadow-sm transition-colors">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-theme-navy dark:text-white">
                                    Report Details
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Provide basic information.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5">
                                        Title *
                                    </label>
                                    <input
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

                                <div>
                                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5">
                                        Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className={inputClass('type')}
                                    >
                                        <option value="">Select...</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    {errors.type && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* Period */}
                                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/60 dark:bg-slate-700/30 transition-colors">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                        Reporting Period
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
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

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/reports')}
                                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-5 py-2.5 bg-theme-navy text-white rounded-xl hover:bg-blue-900 disabled:opacity-50"
                                    >
                                        {loading ? 'Generating...' : 'Generate'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* SIDE PANELS */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-3">
                                Guidelines
                            </h3>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                <li>Choose a clear title.</li>
                                <li>Reports are grouped by type.</li>
                                <li>Stats are auto calculated.</li>
                                <li>Reports can be edited later.</li>
                            </ul>
                        </div>

                        <div className="bg-sky-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-theme-navy dark:text-white mb-2">
                                Note
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Report type cannot be changed later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReportPage;