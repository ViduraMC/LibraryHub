import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getMyTransactions, renewBook } from '../../api/transactions.api.js';

/**
 * Dashboard for users to track their personal library transactions.
 */
const MyTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchTransactions = async () => {
        try {
            const res = await getMyTransactions();
            setTransactions(res.data.transactions);
        } catch (err) {
            toast.error('Failed to load transaction history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleRenew = async (id) => {
        setProcessingId(id);
        try {
            const res = await renewBook(id);
            toast.success(res.data.message);
            setTransactions(transactions.map(t => 
                t._id === id ? { ...t, ...res.data.transaction } : t
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'returned': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">My Borrows</h1>
                    <p className="text-slate-500 mt-2 text-sm">Track your active library resources and manage due dates.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-theme-pale rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-theme-blue uppercase tracking-widest leading-none mb-1">Active</p>
                        <p className="text-xl font-black text-theme-navy">
                            {transactions.filter(t => t.status === 'active' || t.status === 'overdue').length}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-theme-pale/30 border-2 border-dashed border-theme-pale rounded-3xl p-20 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-theme-pale" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-theme-navy mb-2">No active borrows</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm">Your personal shelf is currently empty. Visit the library to check out new materials.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {transactions.map(t => (
                        <div key={t._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-theme-pale transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(t.status)}`}>
                                    {t.status}
                                </span>
                                {t.renewed && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-theme-blue bg-blue-50 px-2 py-1 rounded-md uppercase">
                                        Renewed
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-theme-navy transition-colors">{t.bookId?.name || 'Unknown Title'}</h3>
                                <p className="text-sm text-slate-500 font-medium">By {t.bookId?.author || 'Unknown Author'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Issued</p>
                                    <p className="text-xs font-bold text-slate-700">{new Date(t.borrowDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Return Due</p>
                                    <p className={`text-xs font-bold ${t.status === 'overdue' ? 'text-red-600' : 'text-slate-700'}`}>
                                        {new Date(t.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                {t.status === 'active' && !t.renewed && (
                                    <button
                                        onClick={() => handleRenew(t._id)}
                                        disabled={processingId === t._id}
                                        className="w-full py-3 bg-theme-pale text-theme-blue rounded-2xl font-bold text-sm hover:bg-theme-blue hover:text-white transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                                    >
                                        {processingId === t._id ? (
                                            <span className="w-4 h-4 border-2 border-theme-blue border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <span>Request Renewal</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {t.status === 'returned' && (
                                    <div className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm text-center border border-slate-100 flex items-center justify-center gap-2">
                                        Returned on {new Date(t.returnDate).toLocaleDateString()}
                                    </div>
                                )}

                                {t.status === 'overdue' && (
                                    <div className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm text-center border border-red-100 italic">
                                        Action Required: Return to library
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTransactionsPage;
