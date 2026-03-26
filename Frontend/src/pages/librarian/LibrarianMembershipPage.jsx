import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getMembershipRequests,
    approveRequest,
    rejectRequest,
    updateMembershipRequest,
    deleteMembershipRequest,
} from '../../api/membership.api.js';

/**
 * Librarian: Membership Request Management
 *
 * Tabs: Verified, Approved, Rejected (Pending removed — not applicable).
 * - Verified  → Approve / Reject actions
 * - Approved  → Edit details / Remove with confirmation
 * - Rejected  → Edit details / Remove with confirmation
 */
const LibrarianMembershipPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('verified');
    const [processingId, setProcessingId] = useState(null);
    const [rejectState, setRejectState] = useState({ id: null, reason: '' });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

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

    // --- Verify tab actions ---
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

    // --- Edit actions (Approved / Rejected tabs) ---
    const startEditing = (req) => {
        setEditingId(req._id);
        setEditForm({
            fullName: req.fullName || '',
            email: req.email || '',
            phone: req.phone || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleUpdate = async (id) => {
        setProcessingId(id);
        try {
            await updateMembershipRequest(id, editForm);
            toast.success('Request details updated.');
            setEditingId(null);
            fetchRequests(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Delete action (Approved / Rejected tabs) ---
    const handleDelete = async (req) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently remove ${req.fullName}'s membership request?\n\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        setProcessingId(req._id);
        try {
            await deleteMembershipRequest(req._id);
            toast.success('Request permanently removed.');
            fetchRequests(tab);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // Status badge colours
    const statusStyle = {
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

            {/* Tab filter — Pending removed */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit gap-1">
                {['verified', 'approved', 'rejected'].map((s) => (
                    <button
                        key={s}
                        onClick={() => { setTab(s); cancelEditing(); }}
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
                                            {/* Applicant Name — editable */}
                                            <td className="px-6 py-5">
                                                {editingId === req._id ? (
                                                    <input
                                                        value={editForm.fullName}
                                                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                    />
                                                ) : (
                                                    <p className="font-bold text-slate-800">{req.fullName}</p>
                                                )}
                                            </td>

                                            {/* Type */}
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-theme-blue uppercase tracking-widest">
                                                    {req.applicantType}
                                                </span>
                                            </td>

                                            {/* School ID */}
                                            <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                                {req.applicantType === 'student' ? req.studentId : req.teacherId}
                                            </td>

                                            {/* Email — editable */}
                                            <td className="px-6 py-5">
                                                {editingId === req._id ? (
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-slate-500">{req.email}</span>
                                                )}
                                            </td>

                                            {/* Submitted */}
                                            <td className="px-6 py-5 text-xs text-slate-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                                        statusStyle[req.status] || 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}
                                                >
                                                    {req.status}
                                                </span>
                                                {req.status === 'approved' && req.membershipId && (
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-1">{req.membershipId}</p>
                                                )}
                                                {req.status === 'rejected' && req.rejectionReason && (
                                                    <p className="text-[10px] text-red-400 mt-1">{req.rejectionReason}</p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5">
                                                {/* Verified tab → Approve / Reject */}
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

                                                {/* Approved / Rejected tabs → Edit / Remove */}
                                                {(req.status === 'approved' || req.status === 'rejected') && (
                                                    <div className="flex gap-2">
                                                        {editingId === req._id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdate(req._id)}
                                                                    disabled={processingId === req._id}
                                                                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                                >
                                                                    {processingId === req._id ? '...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEditing(req)}
                                                                    className="px-3 py-1.5 bg-theme-pale text-theme-navy text-xs font-bold rounded-lg hover:bg-blue-100 transition-all"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(req)}
                                                                    disabled={processingId === req._id}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                                                                >
                                                                    {processingId === req._id ? '...' : 'Remove'}
                                                                </button>
                                                            </>
                                                        )}
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
