import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getMembershipRequests,
    approveRequest,
    rejectRequest,
} from '../../api/membership.api.js';

/**
 * Librarian: Membership Request Management
 *
 * Shows all membership applications that passed the auto-verification step
 * (status = "verified"). The librarian can:
 *   - Approve → sends a password-setup email to the applicant
 *   - Reject  → requires a reason; sends a rejection notification
 *
 * "Pending" applications (not yet verified by the system) are also shown
 * but cannot be acted on until the system has verified them.
 */
const LibrarianMembershipPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('verified');
    const [processingId, setProcessingId] = useState(null);
    const [rejectState, setRejectState] = useState({ id: null, reason: '' });

    const fetchRequests = async (status) => {
        setLoading(true);
        try {
            const res = await getMembershipRequests({ status });
            setRequests(res.data.requests || []);
        } catch {
            toast.error('Could not load membership requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(tab);
    }, [tab]);

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await approveRequest(id);
            toast.success('Application approved. A password-setup email has been sent.');
            fetchRequests(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectOpen = (id) => {
        setRejectState({ id, reason: '' });
    };

    const handleRejectCancel = () => {
        setRejectState({ id: null, reason: '' });
    };

    const handleRejectConfirm = async () => {
        if (!rejectState.reason.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }
        setProcessingId(rejectState.id);
        try {
            await rejectRequest(rejectState.id, rejectState.reason.trim());
            toast.info('Application rejected.');
            setRejectState({ id: null, reason: '' });
            fetchRequests(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Rejection failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // Status badge colours
    const statusStyle = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        verified: 'bg-blue-50 text-blue-600 border-blue-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                    Membership Requests
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    Review and process student and teacher library membership applications.
                </p>
            </div>

            {/* Tab filter */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit gap-1">
                {['verified', 'pending', 'approved', 'rejected'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setTab(s)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                            tab === s
                                ? 'bg-theme-navy text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Info banner for "verified" tab */}
            {tab === 'verified' && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-sm text-blue-700">
                    These applications have been automatically verified against the school register.
                    Review the details and <strong>Approve</strong> or <strong>Reject</strong> each one.
                </div>
            )}

            {/* Requests table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Applicant', 'Type', 'School ID', 'Email', 'Submitted', 'Status', 'Actions'].map((h) => (
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
                                        <td colSpan={7} className="px-6 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-20 text-center text-slate-400 italic text-sm"
                                    >
                                        No {tab} requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <>
                                        <tr key={req._id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-800">{req.fullName}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-theme-blue uppercase tracking-widest">
                                                    {req.applicantType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                                {req.schoolId}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-500">{req.email}</td>
                                            <td className="px-6 py-5 text-xs text-slate-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                                        statusStyle[req.status] || 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}
                                                >
                                                    {req.status}
                                                </span>
                                                {req.status === 'rejected' && req.rejectionReason && (
                                                    <p className="text-[10px] text-red-400 mt-1">{req.rejectionReason}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {req.status === 'verified' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(req._id)}
                                                            disabled={processingId === req._id}
                                                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectOpen(req._id)}
                                                            disabled={processingId === req._id}
                                                            className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Inline reject reason input */}
                                        {rejectState.id === req._id && (
                                            <tr key={`${req._id}-reject`} className="bg-red-50/30">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={rejectState.reason}
                                                            onChange={(e) =>
                                                                setRejectState({ ...rejectState, reason: e.target.value })
                                                            }
                                                            placeholder="Reason for rejection (required)"
                                                            className="flex-1 bg-white border border-red-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
                                                        />
                                                        <button
                                                            onClick={handleRejectConfirm}
                                                            disabled={processingId === req._id}
                                                            className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {processingId === req._id ? (
                                                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : null}
                                                            Confirm Reject
                                                        </button>
                                                        <button
                                                            onClick={handleRejectCancel}
                                                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LibrarianMembershipPage;
