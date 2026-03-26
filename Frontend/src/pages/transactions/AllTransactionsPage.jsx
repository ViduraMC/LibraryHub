import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getAllTransactions,
    returnBook,
    softDeleteTransaction,
    getTransactionReturnDetails,
} from '../../api/transactions.api.js';

/**
 * Librarian transaction management with:
 *   - Tabs: All | Borrowed | Overdue | Returned
 *   - Clean table (no "Flags" column)
 *   - Return Confirmation Modal with full transaction + fine details
 *   - Fine-check: blocks return if unpaid fine exists
 */
const AllTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Return modal state
    const [returnModal, setReturnModal] = useState({
        open: false,
        loading: true,
        transaction: null,
        fine: null,
        overdueDays: 0,
    });

    const tabConfig = [
        { key: '', label: 'All' },
        { key: 'active', label: 'Borrowed' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'returned', label: 'Returned' },
    ];

    const fetchAll = async (status = statusFilter) => {
        setLoading(true);
        try {
            const params = {};
            if (status) params.status = status;
            const res = await getAllTransactions(params);
            setTransactions(res.data.transactions);
        } catch {
            toast.error('Failed to load transactions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll(statusFilter);
    }, [statusFilter]);

    // --- Return flow ---
    const openReturnModal = async (transactionId) => {
        setReturnModal({ open: true, loading: true, transaction: null, fine: null, overdueDays: 0 });
        try {
            const res = await getTransactionReturnDetails(transactionId);
            setReturnModal({
                open: true,
                loading: false,
                transaction: res.data.transaction,
                fine: res.data.fine,
                overdueDays: res.data.overdueDays,
            });
        } catch {
            toast.error('Could not load return details.');
            setReturnModal({ open: false, loading: false, transaction: null, fine: null, overdueDays: 0 });
        }
    };

    const closeReturnModal = () => {
        setReturnModal({ open: false, loading: false, transaction: null, fine: null, overdueDays: 0 });
    };

    const confirmReturn = async () => {
        if (!returnModal.transaction) return;
        const id = returnModal.transaction._id;
        setProcessingId(id);
        try {
            const res = await returnBook(id);
            toast.success(res.data.message);
            closeReturnModal();
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Return failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSoftDelete = async (id) => {
        if (!window.confirm('Move this record to the recycle bin?')) return;
        try {
            await softDeleteTransaction(id);
            toast.info('Record moved to recycle bin.');
            fetchAll();
        } catch {
            toast.error('Could not delete the record.');
        }
    };

    // Client-side search
    const visible = searchInput
        ? transactions.filter(
              (t) =>
                  t.userId?.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  t.userId?.membershipId?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  t.bookId?.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  t.bookId?.bookId?.toLowerCase().includes(searchInput.toLowerCase())
          )
        : transactions;

    // Helper: format date
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    // Helper: days until/since due
    const getDaysLabel = (t) => {
        if (t.status === 'returned') return null;
        const now = new Date();
        const due = new Date(t.dueDate);
        const diffMs = due - now;
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-red-500' };
        if (days <= 3) return { text: `${days}d left`, color: 'text-amber-500' };
        return { text: `${days}d left`, color: 'text-slate-400' };
    };

    // Status config
    const statusConfig = {
        active:   { label: 'Borrowed',  bg: 'bg-blue-50',     text: 'text-blue-600',    border: 'border-blue-100' },
        overdue:  { label: 'Overdue',   bg: 'bg-red-50',      text: 'text-red-600',     border: 'border-red-100' },
        returned: { label: 'Returned',  bg: 'bg-emerald-50',  text: 'text-emerald-600', border: 'border-emerald-100' },
        lost:     { label: 'Lost',      bg: 'bg-orange-50',   text: 'text-orange-600',  border: 'border-orange-100' },
    };

    return (
        <div className="space-y-8">
            {/* Header + tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                        Transactions
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Manage all borrow records across the library system.
                    </p>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1">
                    {tabConfig.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                                statusFilter === key
                                    ? 'bg-theme-navy text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by member name, membership ID, book title, or book ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Member', 'Book', 'Status', 'Borrowed', 'Due / Returned', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-slate-50 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                visible.map((t) => {
                                    const sc = statusConfig[t.status] || statusConfig.active;
                                    const daysLabel = getDaysLabel(t);

                                    return (
                                        <tr key={t._id} className="hover:bg-slate-50/30 transition-colors">
                                            {/* Member */}
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-800 text-sm">{t.userId?.fullName}</p>
                                                <p className="text-[10px] text-theme-blue font-bold uppercase tracking-widest mt-0.5">
                                                    {t.userId?.membershipId}
                                                </p>
                                            </td>

                                            {/* Book */}
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{t.bookId?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.bookId?.bookId}</p>
                                            </td>

                                            {/* Status — consolidated */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                        {sc.label}
                                                    </span>
                                                    {t.renewed && (
                                                        <span className="text-[9px] font-bold text-theme-blue">↻ Renewed</span>
                                                    )}
                                                    {t.isLate && t.status === 'returned' && (
                                                        <span className="text-[9px] font-bold text-amber-500">⚠ Late return</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Borrowed date */}
                                            <td className="px-6 py-5">
                                                <p className="text-xs text-slate-600">{fmtDate(t.borrowDate)}</p>
                                            </td>

                                            {/* Due / Returned date */}
                                            <td className="px-6 py-5">
                                                {t.status === 'returned' ? (
                                                    <div>
                                                        <p className="text-xs text-emerald-600 font-bold">{fmtDate(t.returnDate)}</p>
                                                        <p className="text-[10px] text-slate-400">Due: {fmtDate(t.dueDate)}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className={`text-xs font-bold ${t.status === 'overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                                            {fmtDate(t.dueDate)}
                                                        </p>
                                                        {daysLabel && (
                                                            <p className={`text-[10px] font-bold mt-0.5 ${daysLabel.color}`}>
                                                                {daysLabel.text}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(t.status === 'active' || t.status === 'overdue') && (
                                                        <button
                                                            onClick={() => openReturnModal(t._id)}
                                                            className="px-4 py-2 bg-theme-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                                        >
                                                            Return
                                                        </button>
                                                    )}
                                                    {t.status === 'returned' && (
                                                        <button
                                                            onClick={() => handleSoftDelete(t._id)}
                                                            className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                                                            title="Move to recycle bin"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== RETURN CONFIRMATION MODAL ====== */}
            {returnModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        {/* Modal header */}
                        <div className="bg-theme-navy px-8 py-5 flex items-center justify-between">
                            <h2 className="text-white font-black text-lg uppercase tracking-wide">Return Book</h2>
                            <button onClick={closeReturnModal} className="text-white/50 hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {returnModal.loading ? (
                            <div className="p-10 flex items-center justify-center">
                                <span className="w-8 h-8 border-3 border-theme-blue/30 border-t-theme-blue rounded-full animate-spin" />
                            </div>
                        ) : returnModal.transaction ? (
                            <div className="p-8 space-y-6">
                                {/* Member info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-theme-pale rounded-full flex items-center justify-center">
                                        <svg className="h-5 w-5 text-theme-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{returnModal.transaction.userId?.fullName}</p>
                                        <p className="text-xs text-theme-blue font-bold uppercase">{returnModal.transaction.userId?.role} · {returnModal.transaction.userId?.membershipId}</p>
                                    </div>
                                </div>

                                {/* Book info */}
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <p className="font-bold text-slate-800">{returnModal.transaction.bookId?.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">By {returnModal.transaction.bookId?.author}</p>
                                    <div className="flex gap-4 mt-3 text-xs">
                                        <span className="text-slate-400">ID: <span className="font-mono font-bold text-slate-600">{returnModal.transaction.bookId?.bookId}</span></span>
                                        <span className="text-slate-400">Available: <span className="font-bold text-slate-600">{returnModal.transaction.bookId?.availableCopies}/{returnModal.transaction.bookId?.totalCopies}</span></span>
                                    </div>
                                </div>

                                {/* Transaction details grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Borrowed</p>
                                        <p className="text-sm font-bold text-slate-700">{fmtDate(returnModal.transaction.borrowDate)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Due Date</p>
                                        <p className={`text-sm font-bold ${returnModal.overdueDays > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                            {fmtDate(returnModal.transaction.dueDate)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Renewed</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {returnModal.transaction.renewed ? `Yes (${fmtDate(returnModal.transaction.renewedAt)})` : 'No'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                                        <p className={`text-sm font-bold ${returnModal.overdueDays > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {returnModal.overdueDays > 0 ? `Overdue (${returnModal.overdueDays} days)` : 'On time'}
                                        </p>
                                    </div>
                                </div>

                                {/* Fine warning */}
                                {returnModal.fine && returnModal.fine.fineStatus === 'unpaid' ? (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-red-700 text-sm">Unpaid Fine — Cannot Return</p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    This transaction has an unpaid fine of <strong>Rs.{returnModal.fine.fineAmount.toFixed(2)}</strong> ({returnModal.fine.daysOverdue} days overdue).
                                                    The fine must be settled before the book can be returned.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : returnModal.fine && returnModal.fine.fineStatus === 'paid' ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-emerald-700 text-sm">Fine Paid</p>
                                                <p className="text-xs text-emerald-600">Rs.{returnModal.fine.fineAmount.toFixed(2)} settled. Ready to return.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : returnModal.overdueDays > 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-amber-700 text-sm">Overdue — No Fine Recorded Yet</p>
                                                <p className="text-xs text-amber-600">Book is {returnModal.overdueDays} days past due. A fine may be applied by the fine management team.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={closeReturnModal}
                                        className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmReturn}
                                        disabled={
                                            processingId === returnModal.transaction._id ||
                                            (returnModal.fine && returnModal.fine.fineStatus === 'unpaid')
                                        }
                                        className="flex-[2] py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {processingId === returnModal.transaction._id ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Confirm Return
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTransactionsPage;
