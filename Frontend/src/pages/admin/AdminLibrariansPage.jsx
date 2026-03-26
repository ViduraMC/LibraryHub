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
 * Admin: Librarian Management — Full CRUD with toggle switch for status.
 * 60-30-10 theme: White backgrounds, Pale Blue accents, Navy/Blue highlights.
 */
const AdminLibrariansPage = () => {
    const [librarians, setLibrarians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const [form, setForm] = useState({ fullName: '', email: '' });
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

    useEffect(() => { fetchLibrarians(); }, []);

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
        setEditForm({ fullName: lib.fullName, email: lib.email, phone: lib.phone || '' });
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

    // --- Toggle active/inactive with confirmation ---
    const handleToggleStatus = async (lib) => {
        const action = lib.isActive !== false ? 'deactivate' : 'activate';
        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${lib.fullName}?`
        );
        if (!confirmed) return;

        setProcessingId(lib._id);
        try {
            const res = await toggleLibrarianStatus(lib._id);
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
        <div className="space-y-6">
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
                    className="shrink-0 bg-theme-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-theme-blue transition-all text-sm"
                >
                    {showForm ? 'Cancel' : '+ Add Librarian'}
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-theme-pale/30 border border-theme-pale rounded-2xl p-6 space-y-4"
                >
                    <h2 className="text-sm font-black text-theme-navy uppercase tracking-widest">
                        New Librarian Account
                    </h2>
                    <p className="text-xs text-slate-400">
                        A secure temporary password will be generated and emailed to the librarian automatically.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                Full Name *
                            </label>
                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Full Name"
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                Email *
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="librarian@email.com"
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-theme-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-theme-blue transition-all text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {submitting && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Create Account
                    </button>
                </form>
            )}

            {/* Librarians table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-theme-pale/30">
                                {['Name', 'ID', 'Email', 'Status', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100"
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
                                        <td colSpan={5} className="px-5 py-5">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : librarians.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center text-slate-400 italic text-sm">
                                        No librarians found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                librarians.map((lib) => (
                                    <tr key={lib._id} className="hover:bg-theme-pale/10 transition-colors">
                                        {/* Name */}
                                        <td className="px-5 py-4">
                                            {editingId === lib._id ? (
                                                <input
                                                    value={editForm.fullName}
                                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                />
                                            ) : (
                                                <p className="font-bold text-slate-800 text-sm">{lib.fullName}</p>
                                            )}
                                        </td>

                                        {/* Librarian ID */}
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono font-bold text-theme-blue">
                                                {lib.librarianId || '—'}
                                            </span>
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-4">
                                            {editingId === lib._id ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-600">{lib.email}</span>
                                            )}
                                        </td>

                                        {/* Status — Toggle Switch */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(lib)}
                                                    disabled={processingId === lib._id}
                                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                                                        lib.isActive !== false
                                                            ? 'bg-emerald-500'
                                                            : 'bg-slate-300'
                                                    }`}
                                                    title={lib.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                                            lib.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    lib.isActive !== false ? 'text-emerald-600' : 'text-slate-400'
                                                }`}>
                                                    {lib.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {editingId === lib._id ? (
                                                    <>
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
                                                        <button
                                                            onClick={() => startEditing(lib)}
                                                            className="px-3 py-1.5 bg-theme-pale text-theme-navy text-xs font-bold rounded-lg hover:bg-blue-100 transition-all"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lib)}
                                                            disabled={processingId === lib._id}
                                                            className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
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
