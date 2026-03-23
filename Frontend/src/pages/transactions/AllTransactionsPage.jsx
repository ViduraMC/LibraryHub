import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllTransactions, returnBook, softDeleteTransaction } from '../../api/transactions.api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Librarian dashboard for managing all borrow records in the system.
// Supports filtering by status and searching by member name or ID.
const AllTransactionsPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [processingId, setProcessingId] = useState(null);

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

    // Re-fetch whenever the status filter tab changes
    useEffect(() => {
        fetchAll(statusFilter);
    }, [statusFilter]);

    const handleReturn = async (id) => {
        if (!window.confirm('Mark this book as returned?')) return;
        setProcessingId(id);
        try {
            const res = await returnBook(id);
            toast.success(res.data.message);
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

    // Client-side search filter — matches member name or membership ID
    const visible = searchInput
        ? transactions.filter(
              (t) =>
                  t.userId?.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  t.userId?.membershipId?.toLowerCase().includes(searchInput.toLowerCase())
          )
        : transactions;

    // Badge colours for each transaction status
    const statusBadge = {
        active:   'bg-blue-50 text-blue-600 border-blue-100',
        overdue:  'bg-red-50 text-red-600 border-red-100',
        returned: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        lost:     'bg-orange-50 text-orange-600 border-orange-100',
    };

    return (
        <div className="space-y-8">
            {/* Header + status filter tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                        Transactions
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        All borrow records across the library system.
                    </p>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1">
                    {['', 'active', 'overdue', 'returned'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                                statusFilter === s
                                    ? 'bg-theme-navy text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search bar — client-side filter so it's instant */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by member name or membership ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all"
                />
            </div>

            {/* Transactions table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Member', 'Book', 'Status', 'Due Date', 'Flags', 'Actions'].map((h) => (
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
                                visible.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/30 transition-colors">
                                        {/* Member info */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800">{t.userId?.fullName}</p>
                                            <p className="text-[10px] text-theme-blue font-bold uppercase tracking-widest">
                                                {t.userId?.membershipId || t.userId?.role}
                                            </p>
                                        </td>

                                        {/* Book info */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 line-clamp-1">{t.bookId?.name}</p>
                                            <p className="text-xs text-slate-400">{t.bookId?.bookId}</p>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${statusBadge[t.status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {t.status}
                                            </span>
                                        </td>

                                        {/* Due date — red if overdue */}
                                        <td className="px-6 py-5">
                                            <p className={`text-xs font-bold ${t.status === 'overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                                {new Date(t.dueDate).toLocaleDateString()}
                                            </p>
                                        </td>

                                        {/* Extra flags: renewed, late return */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                {t.renewed && (
                                                    <span className="text-[9px] font-bold text-theme-blue bg-blue-50 px-2 py-0.5 rounded-md w-fit uppercase">
                                                        Renewed
                                                    </span>
                                                )}
                                                {t.isLate && (
                                                    <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md w-fit uppercase">
                                                        Late Return
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Action buttons */}
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Return button — only for active/overdue books */}
                                                {(t.status === 'active' || t.status === 'overdue') && (
                                                    <button
                                                        onClick={() => handleReturn(t._id)}
                                                        disabled={processingId === t._id}
                                                        className="px-4 py-2 bg-theme-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                                                    >
                                                        {processingId === t._id ? '...' : 'Return'}
                                                    </button>
                                                )}

                                                {/* Soft delete — sends to recycle bin */}
                                                <button
                                                    onClick={() => handleSoftDelete(t._id)}
                                                    className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                                                    title="Move to recycle bin"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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
        </div>
    );
};

export default AllTransactionsPage;
