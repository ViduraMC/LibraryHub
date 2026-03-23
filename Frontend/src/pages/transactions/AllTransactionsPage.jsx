import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllTransactions, returnBook, softDeleteTransaction } from '../../api/transactions.api.js';

/**
 * Management dashboard for Librarians to monitor all system transactions.
 * Supports status filtering, user search, and processing returns.
 */
const AllTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', userId: '' });
    const [processingId, setProcessingId] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await getAllTransactions(filter);
            setTransactions(res.data.transactions);
        } catch (err) {
            toast.error('Failed to fetch transaction records.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [filter.status]); // refetch on status change

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAll();
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Confirm book return process?')) return;
        
        setProcessingId(id);
        try {
            const res = await returnBook(id);
            toast.success(res.data.message);
            fetchAll(); // refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Return failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSoftDelete = async (id) => {
        if (!window.confirm('Move this transaction to recycle bin?')) return;
        
        try {
            await softDeleteTransaction(id);
            toast.info('Transaction moved to recycle bin.');
            fetchAll();
        } catch (err) {
            toast.error('Failed to delete transaction.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-meridian-navy tracking-tight">System Transactions</h1>
                    <p className="text-slate-500 mt-2">Monitor and manage all active borrowings across the system.</p>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {['', 'active', 'overdue', 'returned'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter({ ...filter, status: s })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                                filter.status === s 
                                ? 'bg-meridian-navy text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by User ID (e.g. ST-26-XXXX)"
                        value={filter.userId}
                        onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-meridian-pale/50 focus:border-meridian-blue transition-all"
                    />
                </div>
                <button type="submit" className="px-8 bg-meridian-blue text-white rounded-2xl font-bold hover:bg-meridian-navy transition-all">
                    Filter
                </button>
            </form>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">User / Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Book Details</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Date Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 italic font-medium">No transactions found matching the criteria.</td>
                                </tr>
                            ) : transactions.map(t => (
                                <tr key={t._id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-slate-800">{t.userId?.fullName}</p>
                                        <p className="text-xs text-meridian-blue font-bold uppercase tracking-tighter">{t.userId?.role}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{t.userId?.email || 'No Email'}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-slate-800 line-clamp-1">{t.bookId?.name}</p>
                                        <p className="text-xs text-slate-500">ID: {t.bookId?.bookId}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                            t.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            t.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Due</p>
                                                <p className={`text-xs font-bold ${t.status === 'overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                                    {new Date(t.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {t.returnDate && (
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">In</p>
                                                    <p className="text-xs font-bold text-emerald-600">{new Date(t.returnDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right space-x-2">
                                        {(t.status === 'active' || t.status === 'overdue') && (
                                            <button
                                                onClick={() => handleReturn(t._id)}
                                                disabled={processingId === t._id}
                                                className="px-4 py-2 bg-meridian-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                                            >
                                                Process Return
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSoftDelete(t._id)}
                                            className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                                            title="Move to Recycle Bin"
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
            </div>
        </div>
    );
};

export default AllTransactionsPage;
