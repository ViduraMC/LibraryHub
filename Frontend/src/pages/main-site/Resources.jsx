import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { listEbooks, downloadEbook, getEbookById } from '../../api/ebook.api.js';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const DownloadIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const XIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const FileIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
);
const EyeIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const UserIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const ChevronLeftIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRightIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);

const CATEGORIES = ['Textbook', 'Reference', 'Novel', 'Pastpaper', 'Guide', 'Other'];
const PAGE_SIZE = 12;

const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Resources() {
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Detail modal
    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const fetchEbooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: PAGE_SIZE };
            if (search) params.q = search;
            if (catFilter) params.category = catFilter;
            const res = await listEbooks(params);
            setEbooks(res.data.data);
            setTotal(res.data.meta.total);
            setTotalPages(Math.ceil(res.data.meta.total / PAGE_SIZE));
        } catch {
            toast.error('Failed to load e-resources');
        } finally {
            setLoading(false);
        }
    }, [search, catFilter, page]);

    useEffect(() => { fetchEbooks(); }, [fetchEbooks]);

    // Open detail → increment view
    const openDetail = async (eb) => {
        setDetailLoading(true);
        setSelected(eb); // show immediately with existing data
        try {
            const res = await getEbookById(eb._id);
            setSelected(res.data.data); // update with incremented view count
        } catch {
            // keep the original data
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!selected) return;
        setDownloading(true);
        try {
            const res = await downloadEbook(selected._id);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = selected.originalFileName || `${selected.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success('Download started');
            // Update download count locally
            setSelected((prev) => prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : prev);
        } catch {
            toast.error('Download failed');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-theme-navy pt-10 pb-0">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Library Hub</p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">eResources</h1>
                    <p className="mt-1.5 text-sm text-slate-400 mb-7">Browse and download e-books uploaded by our librarians.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-7 space-y-5">
                {/* Search + Filter */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, author, description..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                    </div>
                    <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer">
                        <option value="">All Categories</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="text-xs text-slate-400 dark:text-slate-500 self-center shrink-0">{total} e-books found</p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-navy" />
                    </div>
                ) : ebooks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-20">
                        <FileIcon className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No e-books available</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back later or try a different search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {ebooks.map((eb) => (
                            <button key={eb._id} onClick={() => openDetail(eb)}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer text-left hover:shadow-md hover:border-theme-blue/30 dark:hover:border-blue-500/30 transition-all group overflow-hidden">
                                {/* Card cover / icon */}
                                <div className="bg-theme-navy/5 dark:bg-slate-700/50 px-5 pt-6 pb-4 flex items-center justify-center">
                                    <div className="w-16 h-20 bg-theme-navy rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                        <FileIcon className="w-8 h-8 text-theme-pale" />
                                    </div>
                                </div>
                                {/* Card body */}
                                <div className="px-5 py-4 space-y-2">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-theme-blue dark:group-hover:text-theme-pale transition-colors">{eb.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                                        <UserIcon className="w-3 h-3 shrink-0" /> {eb.author}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-theme-pale text-theme-navy dark:bg-slate-700 dark:text-theme-pale">{eb.category}</span>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" />{eb.viewCount}</span>
                                            <span className="flex items-center gap-1"><DownloadIcon className="w-3 h-3" />{eb.downloadCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                            <ChevronLeftIcon />
                        </button>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3">
                            {page} / {totalPages}
                        </span>
                        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                            <ChevronRightIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Detail / Download Modal ── */}
            {selected && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-theme-navy dark:text-white uppercase tracking-widest">E-Book Details</h3>
                            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"><XIcon /></button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-5">
                            {/* Cover + Title */}
                            <div className="flex gap-4 items-start">
                                <div className="w-16 h-20 bg-theme-navy rounded-lg flex items-center justify-center shrink-0 shadow-md">
                                    <FileIcon className="w-8 h-8 text-theme-pale" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-extrabold text-[#0d1b4b] dark:text-white">{selected.title}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selected.author}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-theme-pale text-theme-navy dark:bg-slate-700 dark:text-theme-pale">{selected.category}</span>
                                        {selected.grade && <span className="text-[11px] text-slate-400 dark:text-slate-500">Grade {selected.grade}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selected.description && (
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Description</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selected.description}</p>
                                </div>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-lg font-extrabold text-theme-navy dark:text-theme-pale">{selected.viewCount}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Views</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-lg font-extrabold text-theme-navy dark:text-theme-pale">{selected.downloadCount}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Downloads</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-lg font-extrabold text-theme-navy dark:text-theme-pale">{fmtSize(selected.fileSize)}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">File Size</p>
                                </div>
                            </div>

                            {/* Tags */}
                            {selected.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selected.tags.map((tag) => (
                                        <span key={tag} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Download button */}
                            <button onClick={handleDownload} disabled={downloading}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-theme-navy text-white text-sm font-bold hover:bg-theme-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                                {downloading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Downloading…</>
                                ) : (
                                    <><DownloadIcon className="w-5 h-5" /> Download PDF</>
                                )}
                            </button>

                            {/* Uploaded by */}
                            {selected.uploadedBy && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                                    Uploaded by {selected.uploadedBy.fullName}
                                </p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}