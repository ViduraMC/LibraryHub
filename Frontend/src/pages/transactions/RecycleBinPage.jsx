import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getDeletedTransactions, restoreTransaction, permanentDeleteTransaction } from '../../api/transactions.api.js';

/**
 * Recycling interface for archived transactions.
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
            toast.error('Failed to load archive.');
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
            toast.success('Record restored.');
            fetchDeleted();
        } catch (err) {
            toast.error('Restore failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!window.confirm('WARNING: Permanent deletion. Confirm?')) return;
        setProcessingId(id);
        try {
            await permanentDeleteTransaction(id);
            toast.warning('Record purged.');
            fetchDeleted();
        } catch (err) {
            toast.error('Operation failed.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">Archive Bin</h1>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">Recover or permanently remove archived transaction history.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Identity</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Resource</th>
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
                                <td colSpan="3" className="px-6 py-20 text-center text-slate-400 italic text-sm">No archived records found.</td>
                            </tr>
                        ) : transactions.map(t => (
                            <tr key={t._id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-6 font-sans">
                                    <p className="font-bold text-slate-800">{t.userId?.fullName}</p>
                                    <p className="text-xs text-slate-400 italic">Archived on {new Date(t.deletedAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-6">
                                    <p className="font-bold text-slate-800">{t.bookId?.name}</p>
                                    <p className="text-xs text-slate-500">ID: {t.bookId?.bookId}</p>
                                </td>
                                <td className="px-6 py-6 text-right space-x-3">
                                    <button
                                        onClick={() => handleRestore(t._id)}
                                        disabled={processingId === t._id}
                                        className="px-4 py-2 bg-theme-pale text-theme-blue rounded-xl text-xs font-bold hover:bg-theme-blue hover:text-white transition-all disabled:opacity-50"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(t._id)}
                                        disabled={processingId === t._id}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-all disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <p className="text-xs text-amber-700 leading-relaxed font-medium italic">
                    Restoring entries will automatically adjust book inventory and user borrowing counts.
                </p>
            </div>
        </div>
    );
};

export default RecycleBinPage;
