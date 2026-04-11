import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getDeletedTransactions,
    restoreTransaction,
    permanentDeleteTransaction,
} from '../../api/transactions.api.js';

// Shows all soft-deleted transaction records.
// Librarians can restore a record back to active,
// or permanently delete it (irreversible, requires confirmation).
const RecycleBinPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchDeleted = async () => {
        setLoading(true);
        try {
            const res = await getDeletedTransactions();
            setTransactions(res.data.transactions);
        } catch {
            toast.error('Could not load the recycle bin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeleted();
    }, []);

    const handleRestore = async (id) => {
        setProcessingId(id);
        try {
            await restoreTransaction(id);
            toast.success('Record restored successfully.');
            fetchDeleted();
        } catch {
            toast.error('Restore failed. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!window.confirm('This cannot be undone. Permanently delete this record?')) return;
        setProcessingId(id);
        try {
            await permanentDeleteTransaction(id);
            toast.warning('Record permanently deleted.');
            fetchDeleted();
        } catch {
            toast.error('Could not permanently delete the record.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-theme-navy dark:text-white tracking-tight uppercase">
                    Recycle Bin
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    Archived transaction records. You can restore or permanently delete them here.
                </p>
            </div>

            {/* Warning about permanent delete */}
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-6 py-4 border border-amber-100 dark:border-amber-800">
                <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856C18.996 19 20 17.657 20 16.03V7.97C20 6.343 18.996 5 17.918 5H6.082C5.004 5 4 6.343 4 7.97v8.06C4 17.657 5.004 19 6.062 19z" />
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                    Restoring a record will automatically adjust the book's availability and the member's borrow count.
                    Permanent deletion is irreversible.
                </p>
            </div>

            {/* Deleted records table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-700/50">
                                {['Member', 'Book', 'Archived On', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8">
                                            <div className="h-4 bg-slate-50 dark:bg-slate-700 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                        The recycle bin is empty.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                        {/* Member */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 dark:text-white">{t.userId?.fullName}</p>
                                            <p className="text-[10px] text-theme-blue font-bold uppercase tracking-widest">
                                                {t.userId?.membershipId || t.userId?.role}
                                            </p>
                                        </td>

                                        {/* Book */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 dark:text-white">{t.bookId?.name}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{t.bookId?.bookId}</p>
                                        </td>

                                        {/* When it was soft-deleted */}
                                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                                            {t.deletedAt
                                                ? new Date(t.deletedAt).toLocaleDateString()
                                                : '-'}
                                        </td>

                                        {/* Restore / Permanent delete */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleRestore(t._id)}
                                                    disabled={processingId === t._id}
                                                    className="px-4 py-2 bg-theme-pale dark:bg-blue-900/30 text-theme-blue dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-theme-blue hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(t._id)}
                                                    disabled={processingId === t._id}
                                                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50 cursor-pointer"
                                                >
                                                    Delete Forever
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

export default RecycleBinPage;
