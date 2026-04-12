import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
    getAllUnpaidFines,
    getAllFines,
    calculateOverdueFines,
    markFinePaid,
    cancelFine,
    updateFine,
    deleteFine,
} from '../../api/fines.api.js';

/**
 * Librarian: Fine Management with tabbed views
 *
 * Tabs: Unpaid | Paid | Cancelled | All
 * Features:
 *   - Sync button recalculates/creates overdue fines
 *   - Mark as paid with confirmation
 *   - Edit fine amount/days (unpaid only) with modal
 *   - Delete fine with confirmation (admin only)
 *   - Cancel fine with reason modal
 */
const FineManagementPage = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [tab, setTab] = useState('unpaid');
    const [syncing, setSyncing] = useState(false);

    // Modal states
    const [confirmPay, setConfirmPay] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [cancelModal, setCancelModal] = useState({ fine: null, reason: '' });
    const [editModal, setEditModal] = useState({ fine: null, amount: '', days: '' });

    const tabConfig = [
        { key: 'unpaid', label: 'Unpaid' },
        { key: 'paid', label: 'Paid' },
        { key: 'cancelled', label: 'Cancelled' },
        { key: '', label: 'All History' },
    ];

    const fetchFines = async (status = tab) => {
        setLoading(true);
        try {
            let res;
            if (status === 'unpaid') {
                res = await getAllUnpaidFines();
            } else {
                const params = {};
                if (status) params.status = status;
                res = await getAllFines(params);
            }
            setFines(res.data.fines || []);
        } catch {
            toast.error('Failed to load fines.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines(tab);
    }, [tab]);

    const handleSyncFines = async () => {
        setSyncing(true);
        try {
            const res = await calculateOverdueFines();
            const msg = res.data.message || 'Fines synced successfully!';
            toast.success(msg);
            fetchFines(tab);
        } catch {
            toast.error('Failed to sync fines.');
        } finally {
            setSyncing(false);
        }
    };

    // Mark as paid
    const handleMarkPaid = async () => {
        if (!confirmPay) return;
        setProcessingId(confirmPay._id);
        try {
            const res = await markFinePaid(confirmPay._id);
            toast.success(res.data.message || 'Fine marked as paid.');
            fetchFines(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark as paid.');
        } finally {
            setProcessingId(null);
            setConfirmPay(null);
        }
    };

    // Cancel fine
    const handleCancelFine = async () => {
        if (!cancelModal.fine || !cancelModal.reason.trim()) {
            toast.error('Please provide a cancellation reason.');
            return;
        }
        setProcessingId(cancelModal.fine._id);
        try {
            const res = await cancelFine(cancelModal.fine._id, cancelModal.reason.trim());
            toast.success(res.data.message || 'Fine cancelled.');
            setCancelModal({ fine: null, reason: '' });
            fetchFines(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel fine.');
        } finally {
            setProcessingId(null);
        }
    };

    // Edit fine
    const handleEditFine = async () => {
        if (!editModal.fine) return;
        const amount = parseFloat(editModal.amount);
        const days = parseInt(editModal.days, 10);

        if (isNaN(amount) || amount < 0) {
            toast.error('Please enter a valid fine amount.');
            return;
        }
        if (isNaN(days) || days < 0) {
            toast.error('Please enter valid overdue days.');
            return;
        }

        setProcessingId(editModal.fine._id);
        try {
            await updateFine(editModal.fine._id, { fineAmount: amount, daysOverdue: days });
            toast.success('Fine updated successfully.');
            setEditModal({ fine: null, amount: '', days: '' });
            fetchFines(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update fine.');
        } finally {
            setProcessingId(null);
        }
    };

    // Delete fine
    const handleDeleteFine = async () => {
        if (!confirmDelete) return;
        setProcessingId(confirmDelete._id);
        try {
            await deleteFine(confirmDelete._id);
            toast.success('Fine permanently deleted.');
            fetchFines(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete fine.');
        } finally {
            setProcessingId(null);
            setConfirmDelete(null);
        }
    };

    // Client-side search
    const visible = searchInput
        ? fines.filter(
            (f) =>
                f.userId?.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                f.userId?.membershipId?.toLowerCase().includes(searchInput.toLowerCase()) ||
                f.bookId?.name?.toLowerCase().includes(searchInput.toLowerCase())
        )
        : fines;

    const fmtDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

    const statusBadge = (status) => {
        const map = {
            unpaid: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800',
            paid: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
            cancelled: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
            refunded: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800',
        };
        return map[status] || map.unpaid;
    };

    // Common modal backdrop
    const ModalBackdrop = ({ children, onClose }) =>
        createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                    {children}
                </div>
            </div>,
            document.body
        );

    return (
        <div className="space-y-8">
            {/* Mark Paid confirmation */}
            {confirmPay && (
                <ModalBackdrop onClose={() => setConfirmPay(null)}>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-center text-theme-navy dark:text-white font-bold text-lg mb-1">Mark as Paid?</h3>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-1">
                        Fine of <span className="font-bold text-theme-navy dark:text-white">Rs. {confirmPay.fineAmount}</span> for{' '}
                        <span className="font-semibold">{confirmPay.userId?.fullName}</span>
                    </p>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-6">The member will be notified via email.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmPay(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleMarkPaid} disabled={processingId === confirmPay._id} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer">
                            {processingId === confirmPay._id ? 'Processing...' : 'Confirm Paid'}
                        </button>
                    </div>
                </ModalBackdrop>
            )}

            {/* Cancel fine modal */}
            {cancelModal.fine && (
                <ModalBackdrop onClose={() => setCancelModal({ fine: null, reason: '' })}>
                    <h3 className="text-theme-navy dark:text-white font-bold text-lg mb-1">Cancel Fine</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        Waive the fine of <span className="font-bold">Rs. {cancelModal.fine.fineAmount}</span> for{' '}
                        <span className="font-semibold">{cancelModal.fine.userId?.fullName}</span>
                    </p>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Cancellation Reason *</label>
                    <textarea
                        value={cancelModal.reason}
                        onChange={(e) => setCancelModal((s) => ({ ...s, reason: e.target.value }))}
                        placeholder="Provide the reason for cancellation..."
                        rows={3}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-theme-blue/30 resize-none mb-4"
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setCancelModal({ fine: null, reason: '' })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Back</button>
                        <button onClick={handleCancelFine} disabled={processingId === cancelModal.fine._id} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer">
                            {processingId === cancelModal.fine._id ? 'Processing...' : 'Cancel Fine'}
                        </button>
                    </div>
                </ModalBackdrop>
            )}

            {/* Edit fine modal */}
            {editModal.fine && (
                <ModalBackdrop onClose={() => setEditModal({ fine: null, amount: '', days: '' })}>
                    <h3 className="text-theme-navy dark:text-white font-bold text-lg mb-4">Edit Fine</h3>
                    <div className="space-y-3 mb-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Fine Amount (Rs.)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={editModal.amount}
                                onChange={(e) => setEditModal((s) => ({ ...s, amount: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-blue/30"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Days Overdue</label>
                            <input
                                type="number" min="0"
                                value={editModal.days}
                                onChange={(e) => setEditModal((s) => ({ ...s, days: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-blue/30"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setEditModal({ fine: null, amount: '', days: '' })} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleEditFine} disabled={processingId === editModal.fine._id} className="flex-1 px-4 py-2.5 rounded-xl bg-theme-navy text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer">
                            {processingId === editModal.fine._id ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </ModalBackdrop>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <ModalBackdrop onClose={() => setConfirmDelete(null)}>
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-center text-theme-navy dark:text-white font-bold text-lg mb-1">Permanently Delete Fine?</h3>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-2">
                        Rs. {confirmDelete.fineAmount} fine for <span className="font-semibold">{confirmDelete.userId?.fullName}</span>
                    </p>
                    <p className="text-center text-xs text-red-500 font-semibold mb-6">This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleDeleteFine} disabled={processingId === confirmDelete._id} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer">
                            {processingId === confirmDelete._id ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </ModalBackdrop>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white tracking-tight uppercase">
                        Fine Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Manage overdue fines, view payment history, and sync calculations.
                    </p>
                </div>
                <button
                    onClick={handleSyncFines}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-navy text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
                >
                    <svg className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {syncing ? 'Syncing...' : 'Sync Fines'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabConfig.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            tab === t.key
                                ? 'bg-theme-navy text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by member name, membership ID, or book title..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-700/30">
                                {['Member', 'Book Details', 'Overdue', 'Amount', 'Status', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                                            <svg className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="font-semibold text-sm">
                                                {tab === 'unpaid' ? 'No unpaid fines. The library is clean!' : `No ${tab || ''} fines found.`}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visible.map((f) => (
                                    <tr key={f._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/20 transition-colors">
                                        {/* Member */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{f.userId?.fullName || 'Unknown'}</p>
                                            <p className="text-[10px] text-theme-blue dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                                                {f.userId?.membershipId}
                                            </p>
                                        </td>

                                        {/* Book */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{f.bookId?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{f.bookId?.bookId}</p>
                                        </td>

                                        {/* Overdue */}
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800">
                                                {f.daysOverdue} Days
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                                                {fmtDate(f.createdAt)}
                                            </p>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-5">
                                            <p className="text-[16px] font-black text-slate-800 dark:text-white">
                                                Rs. {f.fineAmount}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${statusBadge(f.fineStatus)}`}>
                                                {f.fineStatus}
                                            </span>
                                            {f.fineStatus === 'paid' && f.paymentDate && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{fmtDate(f.paymentDate)}</p>
                                            )}
                                            {f.fineStatus === 'cancelled' && f.cancellationReason && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1" title={f.cancellationReason}>{f.cancellationReason}</p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {f.fineStatus === 'unpaid' && (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmPay(f)}
                                                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm cursor-pointer"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                        <button
                                                            onClick={() => setEditModal({ fine: f, amount: String(f.fineAmount), days: String(f.daysOverdue) })}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setCancelModal({ fine: f, reason: '' })}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
                                                        >
                                                            Waive
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDelete(f)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary bar */}
            {!loading && fines.length > 0 && (
                <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>Total: <span className="font-bold text-theme-navy dark:text-white">{fines.length}</span> fines</span>
                    <span>
                        Total Amount:{' '}
                        <span className="font-bold text-theme-navy dark:text-white">
                            Rs. {fines.reduce((s, f) => s + (f.fineAmount || 0), 0)}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default FineManagementPage;
