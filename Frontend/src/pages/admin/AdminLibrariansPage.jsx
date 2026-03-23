import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllLibrarians, createLibrarian } from '../../api/admin.api.js';

/**
 * Admin: Librarian Management
 *
 * - View all current librarians in a table
 * - Create a new librarian account via the side form
 *   (backend sends a password-setup email to the new librarian)
 */
const AdminLibrariansPage = () => {
    const [librarians, setLibrarians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
    });

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

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLibrarian(form);
            toast.success(`Librarian account created. A setup email has been sent to ${form.email}.`);
            setForm({ fullName: '', email: '', password: '' });
            setShowForm(false);
            fetchLibrarians();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create librarian.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
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
                        Manage librarian accounts for your library system.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="shrink-0 bg-theme-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 text-sm"
                >
                    {showForm ? 'Cancel' : '+ Add Librarian'}
                </button>
            </div>

            {/* Create form — visible when showForm is true */}
            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5"
                >
                    <h2 className="text-lg font-bold text-slate-800">New Librarian Account</h2>
                    <p className="text-sm text-slate-400 -mt-2">
                        The librarian will receive an email with a link to set their own password.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Temporary Password *
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="Min. 6 characters"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-theme-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-theme-navy transition-all text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
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
                                {['Name', 'Librarian ID', 'Email', 'Status'].map((h) => (
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
                                        <td colSpan={4} className="px-6 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : librarians.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-20 text-center text-slate-400 italic text-sm"
                                    >
                                        No librarians found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                librarians.map((lib) => (
                                    <tr key={lib._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800">{lib.fullName}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono font-bold text-theme-blue">
                                                {lib.librarianId || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {lib.email}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                                    lib.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}
                                            >
                                                {lib.status || 'active'}
                                            </span>
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
