import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getAllLibrarians,
    createLibrarian,
    updateLibrarian,
    toggleLibrarianStatus,
    deleteLibrarian,
} from '../../api/admin.api.js';

/**
 * Admin: Librarian Management
 *
 * Full CRUD:
 *  - View all librarians in a table
 *  - Create a new librarian (backend emails temp password)
 *  - Edit librarian details (inline edit row)
 *  - Toggle active/inactive status
 *  - Delete with confirmation dialog
 */
const AdminLibrariansPage = () => {
    const [librarians, setLibrarians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // create form state
    const [form, setForm] = useState({ fullName: '', email: '' });

    // edit state — which librarian is being edited and the draft values
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' });

    const fetchLibrarians = async () => {
        setLoading(true);
        try {
            const res = await getAllLibrarians();
            setLibrarians(res.data.librarians || []);
        } catch {
            toast.error('Could not load librarians.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrarians();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // --- Create ---
    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLibrarian(form);
            toast.success(`Account created. Credentials emailed to ${form.email}.`);
            setForm({ fullName: '', email: '' });
            setShowForm(false);
            fetchLibrarians();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create librarian.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Edit ---
    const startEditing = (lib) => {
        setEditingId(lib._id);
        setEditForm({
            fullName: lib.fullName,
            email: lib.email,
            phone: lib.phone || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ fullName: '', email: '', phone: '' });
    };

    const handleUpdate = async (id) => {
        setProcessingId(id);
        try {
            await updateLibrarian(id, editForm);
            toast.success('Librarian updated.');
            setEditingId(null);
            fetchLibrarians();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Toggle active/inactive ---
    const handleToggleStatus = async (id) => {
        setProcessingId(id);
        try {
            const res = await toggleLibrarianStatus(id);
            toast.success(res.data.message);
            fetchLibrarians();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Status change failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Delete with confirmation ---
    const handleDelete = async (lib) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${lib.fullName}'s account?\n\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        setProcessingId(lib._id);
        try {
            await deleteLibrarian(lib._id);
            toast.success('Librarian account deleted.');
            fetchLibrarians();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                        Librarians
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Manage librarian accounts — create, edit, activate/deactivate, or remove.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="shrink-0 bg-theme-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 text-sm"
                >
                    {showForm ? 'Cancel' : '+ Add Librarian'}
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5"
                >
                    <h2 className="text-lg font-bold text-slate-800">New Librarian Account</h2>
                    <p className="text-sm text-slate-400 -mt-2">
                        The system will auto-generate a secure temporary password and email it directly to the librarian.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Full Name *
                            </label>
                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Full Name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Email *
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="librarian@email.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-theme-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-theme-navy transition-all text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {submitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Create Account
                    </button>
                </form>
            )}

            {/* Librarians table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Name', 'Librarian ID', 'Email', 'Status', 'Actions'].map((h) => (
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
                                        <td colSpan={5} className="px-6 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : librarians.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-20 text-center text-slate-400 italic text-sm"
                                    >
                                        No librarians found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                librarians.map((lib) => (
                                    <tr key={lib._id} className="hover:bg-slate-50/30 transition-colors">
                                        {/* Name — editable when editing */}
                                        <td className="px-6 py-5">
                                            {editingId === lib._id ? (
                                                <input
                                                    value={editForm.fullName}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, fullName: e.target.value })
                                                    }
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                />
                                            ) : (
                                                <p className="font-bold text-slate-800">{lib.fullName}</p>
                                            )}
                                        </td>

                                        {/* Librarian ID — always read-only */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono font-bold text-theme-blue">
                                                {lib.librarianId || '—'}
                                            </span>
                                        </td>

                                        {/* Email — editable when editing */}
                                        <td className="px-6 py-5">
                                            {editingId === lib._id ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, email: e.target.value })
                                                    }
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-600">{lib.email}</span>
                                            )}
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                                    lib.isActive !== false
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}
                                            >
                                                {lib.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {editingId === lib._id ? (
                                                    <>
                                                        {/* Save / Cancel buttons while editing */}
                                                        <button
                                                            onClick={() => handleUpdate(lib._id)}
                                                            disabled={processingId === lib._id}
                                                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                        >
                                                            {processingId === lib._id ? '...' : 'Save'}
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
                                                        {/* Edit button */}
                                                        <button
                                                            onClick={() => startEditing(lib)}
                                                            className="px-3 py-1.5 bg-theme-pale text-theme-navy text-xs font-bold rounded-lg hover:bg-blue-100 transition-all"
                                                            title="Edit details"
                                                        >
                                                            Edit
                                                        </button>

                                                        {/* Toggle active/inactive */}
                                                        <button
                                                            onClick={() => handleToggleStatus(lib._id)}
                                                            disabled={processingId === lib._id}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 ${
                                                                lib.isActive !== false
                                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                            title={lib.isActive !== false ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {processingId === lib._id
                                                                ? '...'
                                                                : lib.isActive !== false
                                                                    ? 'Deactivate'
                                                                    : 'Activate'}
                                                        </button>

                                                        {/* Delete with confirm */}
                                                        <button
                                                            onClick={() => handleDelete(lib)}
                                                            disabled={processingId === lib._id}
                                                            className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                                                            title="Delete permanently"
                                                        >
                                                            {processingId === lib._id ? '...' : 'Delete'}
                                                        </button>
                                                    </>
                                                )}
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

export default AdminLibrariansPage;
