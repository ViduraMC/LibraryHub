import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { listEbooks, uploadEbook, updateEbook, deleteEbook } from '../../api/ebook.api.js';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const UploadIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const EditIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const TrashIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const XIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const EyeIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const DownloadIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const FileIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
);

const CATEGORIES = ['Textbook', 'Reference', 'Novel', 'Pastpaper', 'Guide', 'Other'];

const fmtSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide }) => {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-theme-navy dark:text-white uppercase tracking-widest">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"><XIcon /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
};

// ── Reusable form components (must be outside the main component to avoid re-creation) ──
const InputField = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        {rows ? (
            <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none" />
        ) : (
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        )}
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <select value={value} onChange={onChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer">
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EbookManagementPage() {
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
    const searchTimer = useRef(null);

    // Upload modal
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', author: '', description: '', category: 'Other', grade: '', tags: '' });
    const [pdfFile, setPdfFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Edit modal
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editing, setEditing] = useState(false);

    // Delete modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch ebooks ──────────────────────────────────────────────────────────
    const fetchEbooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: meta.page, limit: meta.limit, showInactive: 'true' };
            if (debouncedSearch) params.q = debouncedSearch;
            if (catFilter) params.category = catFilter;
            const res = await listEbooks(params);
            setEbooks(res.data.data);
            setMeta(res.data.meta);
        } catch {
            toast.error('Failed to load e-books');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, catFilter, meta.page, meta.limit]);

    useEffect(() => { fetchEbooks(); }, [fetchEbooks]);

    // Debounce search input
    const handleSearchChange = (val) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setMeta((m) => ({ ...m, page: 1 }));
        }, 400);
    };

    // ── Upload handler ────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!uploadForm.title.trim() || !uploadForm.author.trim()) { toast.error('Title and author are required'); return; }
        if (!pdfFile) { toast.error('Please select a PDF file'); return; }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('pdf', pdfFile);
            Object.entries(uploadForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
            await uploadEbook(fd);
            toast.success('E-book uploaded successfully');
            setShowUpload(false);
            setUploadForm({ title: '', author: '', description: '', category: 'Other', grade: '', tags: '' });
            setPdfFile(null);
            fetchEbooks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // ── Edit handler ──────────────────────────────────────────────────────────
    const openEdit = (eb) => {
        setEditTarget(eb);
        setEditForm({ title: eb.title, author: eb.author, description: eb.description, category: eb.category, grade: eb.grade, tags: eb.tags?.join(', ') || '', isActive: eb.isActive });
    };

    const handleEdit = async () => {
        if (!editForm.title?.trim() || !editForm.author?.trim()) { toast.error('Title and author are required'); return; }
        setEditing(true);
        try {
            await updateEbook(editTarget._id, editForm);
            toast.success('E-book updated');
            setEditTarget(null);
            fetchEbooks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setEditing(false);
        }
    };

    // ── Delete handler ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteEbook(deleteTarget._id);
            toast.success('E-book deleted');
            setDeleteTarget(null);
            fetchEbooks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-theme-navy pt-10 pb-0">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Library Hub</p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">E-Book Management</h1>
                    <p className="mt-1.5 text-sm text-slate-400 mb-7">Upload, manage and track e-book downloads.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-7 space-y-5">
                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by title, author..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                    </div>
                    <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setMeta((m) => ({ ...m, page: 1 })); }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer">
                        <option value="">All Categories</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => setShowUpload(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-theme-navy text-white text-sm font-semibold hover:bg-theme-blue transition-all cursor-pointer shrink-0">
                        <UploadIcon className="w-4 h-4" /> Upload E-Book
                    </button>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total E-Books', val: meta.total },
                        { label: 'Total Views', val: ebooks.reduce((s, e) => s + (e.viewCount || 0), 0) },
                        { label: 'Total Downloads', val: ebooks.reduce((s, e) => s + (e.downloadCount || 0), 0) },
                        { label: 'Categories', val: new Set(ebooks.map((e) => e.category)).size },
                    ].map(({ label, val }) => (
                        <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-theme-navy flex items-center justify-center shrink-0">
                                <span className="text-white text-sm font-extrabold">{val}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-navy" />
                        </div>
                    ) : ebooks.length === 0 ? (
                        <div className="text-center py-20">
                            <FileIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No e-books found</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Upload your first e-book to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Views</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Downloads</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-5 py-3 font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {ebooks.map((eb) => (
                                        <tr key={eb._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-slate-800 dark:text-white truncate max-w-[200px]">{eb.title}</p>
                                                {eb.grade && <p className="text-[11px] text-slate-400 dark:text-slate-500">Grade {eb.grade}</p>}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{eb.author}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-theme-pale text-theme-navy dark:bg-slate-700 dark:text-theme-pale">{eb.category}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300"><EyeIcon className="w-3.5 h-3.5 text-slate-400" /> {eb.viewCount}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300"><DownloadIcon className="w-3.5 h-3.5 text-slate-400" /> {eb.downloadCount}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{fmtSize(eb.fileSize)}</td>
                                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{fmtDate(eb.createdAt)}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${eb.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                    {eb.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openEdit(eb)} title="Edit"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-theme-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(eb)} title="Delete"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {meta.total > meta.limit && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Page {meta.page} of {Math.ceil(meta.total / meta.limit)} ({meta.total} items)
                            </p>
                            <div className="flex gap-1.5">
                                <button disabled={meta.page <= 1} onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                                    Previous
                                </button>
                                <button disabled={meta.page >= Math.ceil(meta.total / meta.limit)} onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Upload Modal ── */}
            <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload E-Book" wide>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Title *" value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Mathematics Grade 10" />
                        <InputField label="Author *" value={uploadForm.author} onChange={(e) => setUploadForm((f) => ({ ...f, author: e.target.value }))} placeholder="e.g. John Doe" />
                    </div>
                    <InputField label="Description" value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of the e-book" rows={3} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectField label="Category" value={uploadForm.category} onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))} options={CATEGORIES} />
                        <InputField label="Grade" value={uploadForm.grade} onChange={(e) => setUploadForm((f) => ({ ...f, grade: e.target.value }))} placeholder="e.g. 10" />
                        <InputField label="Tags (comma-separated)" value={uploadForm.tags} onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))} placeholder="e.g. maths, algebra" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PDF File *</label>
                        <div className="relative">
                            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-theme-navy file:text-white file:cursor-pointer hover:file:bg-theme-blue transition-all cursor-pointer" />
                        </div>
                        {pdfFile && <p className="text-[11px] text-slate-400">Selected: {pdfFile.name} ({fmtSize(pdfFile.size)})</p>}
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                        <button onClick={() => setShowUpload(false)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">Cancel</button>
                        <button onClick={handleUpload} disabled={uploading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-navy text-white text-sm font-semibold hover:bg-theme-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                            {uploading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : <><UploadIcon className="w-4 h-4" /> Upload</>}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit E-Book" wide>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Title *" value={editForm.title || ''} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" />
                        <InputField label="Author *" value={editForm.author || ''} onChange={(e) => setEditForm((f) => ({ ...f, author: e.target.value }))} placeholder="Author" />
                    </div>
                    <InputField label="Description" value={editForm.description || ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectField label="Category" value={editForm.category || 'Other'} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} options={CATEGORIES} />
                        <InputField label="Grade" value={editForm.grade || ''} onChange={(e) => setEditForm((f) => ({ ...f, grade: e.target.value }))} placeholder="Grade" />
                        <InputField label="Tags (comma-separated)" value={editForm.tags || ''} onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Tags" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visibility</label>
                        <button onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${editForm.isActive ? 'bg-theme-navy' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${editForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{editForm.isActive ? 'Visible to users' : 'Hidden from users'}</span>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                        <button onClick={() => setEditTarget(null)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">Cancel</button>
                        <button onClick={handleEdit} disabled={editing}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-navy text-white text-sm font-semibold hover:bg-theme-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                            {editing ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete Modal ── */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete E-Book">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                        <TrashIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">This action cannot be undone</p>
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                                The e-book <strong>"{deleteTarget?.title}"</strong> and its PDF file will be permanently deleted.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2.5">
                        <button onClick={() => setDeleteTarget(null)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">Cancel</button>
                        <button onClick={handleDelete} disabled={deleting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                            {deleting ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</> : <><TrashIcon className="w-4 h-4" /> Delete</>}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
