import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getDeletedTransactions, restoreTransaction, permanentDeleteTransaction } from '../../api/transactions.api.js';

/**
 * Management interface for soft-deleted transaction records.
 * Allows Librarians to restore misdeleted entries or conduct permanent cleanup.
 */
const RecycleBinPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchDeleted = async () => {
        setLoading(true);
        try {
            const res = await getDeletedTransactions();
            setTransactions(res.data.transactions);
        } catch (err) {
            toast.error('Could not load recycle bin contents.');
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
            toast.success('Transaction restored successfully!');
            fetchDeleted();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Restore failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!window.confirm('WARNING: This action is permanent and cannot be reversed. Delete forever?')) return;
        
        setProcessingId(id);
        try {
            await permanentDeleteTransaction(id);
            toast.warning('Transaction permanently removed.');
            fetchDeleted();
        } catch (err) {
            toast.error('Permanent delete failed.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-meridian-navy tracking-tight">Recycle Bin</h1>
                <p className="text-slate-500 mt-2">Manage soft-deleted transaction records and system history.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">User / Identity</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Book Details</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            [1, 2].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="3" className="px-6 py-8"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-20 text-center text-slate-400 italic">Recycle bin is empty.</td>
                            </tr>
                        ) : transactions.map(t => (
                            <tr key={t._id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-6">
                                    <p className="font-bold text-slate-800">{t.userId?.fullName}</p>
                                    <p className="text-xs text-slate-400">Deleted on {new Date(t.deletedAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-6">
                                    <p className="font-bold text-slate-800">{t.bookId?.name}</p>
                                    <p className="text-xs text-slate-400">ID: {t.bookId?.bookId}</p>
                                </td>
                                <td className="px-6 py-6 text-right space-x-3">
                                    <button
                                        onClick={() => handleRestore(t._id)}
                                        disabled={processingId === t._id}
                                        className="px-4 py-2 bg-meridian-pale text-meridian-blue rounded-xl text-xs font-bold hover:bg-meridian-blue hover:text-white transition-all disabled:opacity-50"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(t._id)}
                                        disabled={processingId === t._id}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-all disabled:opacity-50"
                                        title="Delete Permanently"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 mr-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    Restoring a transaction will automatically re-decrement the book's availability and re-increment the user's borrowing count, as if it was never deleted.
                </p>
            </div>
        </div>
    );
};

export default RecycleBinPage;
