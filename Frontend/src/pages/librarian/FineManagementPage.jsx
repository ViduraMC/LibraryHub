import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllUnpaidFines, calculateOverdueFines, markFinePaid } from '../../api/fines.api.js';

const FineManagementPage = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchFines = async () => {
        setLoading(true);
        try {
            const res = await getAllUnpaidFines();
            setFines(res.data.fines || []);
        } catch {
            toast.error('Failed to load unpaid fines.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, []);

    const handleSyncFines = async () => {
        try {
            await calculateOverdueFines();
            toast.success('Fines calculation synced successfully!');
            fetchFines();
        } catch {
            toast.error('Failed to sync calculation.');
        }
    };

    const handleMarkPaid = async (fineId) => {
        if (!window.confirm('Are you certain you want to mark this fine as paid? This will notify the user via email.')) return;

        setProcessingId(fineId);
        try {
            const res = await markFinePaid(fineId);
            toast.success(res.data.message || 'Fine marked as paid.');
            fetchFines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark as paid.');
        } finally {
            setProcessingId(null);
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

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                        Fine Management
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Manage overdue books and unpaid fines across the library.
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleSyncFines}
                        className="px-5 py-2.5 bg-theme-navy text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync Fines
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by member name, membership ID, or book title..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Member', 'Book Details', 'Overdue Timeline', 'Fine Amount', 'Actions'].map((h) => (
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
                                [1, 2].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-slate-50 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                        No unpaid fines found. The library is squeaky clean!
                                    </td>
                                </tr>
                            ) : (
                                visible.map((f) => (
                                    <tr key={f._id} className="hover:bg-slate-50/30 transition-colors">
                                        {/* Member */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 text-sm">{f.userId?.fullName}</p>
                                            <p className="text-[10px] text-theme-blue font-bold uppercase tracking-widest mt-0.5">
                                                {f.userId?.membershipId}
                                            </p>
                                        </td>

                                        {/* Book */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{f.bookId?.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{f.bookId?.bookId}</p>
                                        </td>

                                        {/* Overdue */}
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border bg-red-50 text-red-600 border-red-100">
                                                {f.daysOverdue} Days Late
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-500 mt-2">
                                                Created: {fmtDate(f.createdAt)}
                                            </p>
                                        </td>

                                        {/* Fine Amount */}
                                        <td className="px-6 py-5">
                                            <p className="text-[16px] font-black text-slate-800">
                                                Rs. {f.fineAmount}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                Unpaid
                                            </p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleMarkPaid(f._id)}
                                                    disabled={processingId === f._id}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200/40 disabled:opacity-50"
                                                >
                                                    {processingId === f._id ? 'Processing...' : 'Mark Paid'}
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

export default FineManagementPage;
