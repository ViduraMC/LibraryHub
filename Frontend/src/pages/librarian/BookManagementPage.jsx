import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBooks, deleteBook } from '../../api/book.api.js';

/**
 * Librarian: Book Management
 *
 * Full CRUD table for library books.
 * Features: search, filter by grade/type, delete with confirmation, pagination.
 */
const BookManagementPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterType, setFilterType] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const PAGE_SIZE = 10;

    const BOOK_TYPES = ['Textbook', 'Reference', 'Novel', 'Magazine', 'Pastpaper', 'Fictional', 'Other'];
    const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.q = search;
            if (filterGrade) params.grade = filterGrade;
            if (filterType) params.type = filterType;

            const res = await getBooks(params);
            setBooks(res.data.data || []);
        } catch {
            toast.error('Failed to load books.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        setCurrentPage(1);
    }, [search, filterGrade, filterType]);

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete._id);
        try {
            await deleteBook(confirmDelete._id);
            toast.success(`"${confirmDelete.name}" deleted successfully.`);
            setBooks(books.filter((b) => b._id !== confirmDelete._id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete book.');
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setFilterGrade('');
        setFilterType('');
    };

    const hasFilters = search || filterGrade || filterType;
    const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
    const pagedBooks = books.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="space-y-8">
            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-center text-theme-navy dark:text-white font-bold text-lg mb-1">Delete Book?</h3>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-theme-navy dark:text-white">{confirmDelete.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deletingId === confirmDelete._id}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {deletingId === confirmDelete._id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy dark:text-white tracking-tight uppercase">
                        Book Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Add, edit, and manage all books in the library catalog.
                    </p>
                </div>
                <Link
                    to="/librarian/books/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-navy text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Book
                </Link>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by title, author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-5 py-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all"
                    />
                </div>
                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all cursor-pointer"
                >
                    <option value="">All Grades</option>
                    {GRADES.map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                    ))}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all cursor-pointer"
                >
                    <option value="">All Types</option>
                    {BOOK_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-700/30">
                                {['Book', 'Author', 'Grade', 'Type', 'Copies', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : pagedBooks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                                            <svg className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p className="font-semibold text-sm">
                                                {hasFilters ? 'No books match the current filters.' : 'No books in the catalog yet.'}
                                            </p>
                                            {!hasFilters && (
                                                <Link to="/librarian/books/new" className="mt-2 text-xs font-bold text-theme-blue hover:underline">
                                                    Add the first book
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pagedBooks.map((book) => (
                                    <tr key={book._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        {/* Book info */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {book.img ? (
                                                    <img src={book.img} alt={book.name} className="w-10 h-14 rounded-lg object-cover shrink-0 border border-slate-100 dark:border-slate-600" />
                                                ) : (
                                                    <div className="w-10 h-14 rounded-lg bg-theme-pale dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5 text-theme-blue dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{book.name}</p>
                                                    <p className="text-[10px] text-theme-blue dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">{book.bookId}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Author */}
                                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">{book.author}</td>

                                        {/* Grade */}
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border bg-theme-pale dark:bg-blue-900/30 text-theme-navy dark:text-blue-300 border-theme-pale dark:border-blue-800">
                                                Grade {book.grade}
                                            </span>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{book.type}</span>
                                        </td>

                                        {/* Copies */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-theme-navy dark:text-white">{book.availableCopies}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">of {book.totalCopies}</p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/librarian/books/${book._id}`}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-theme-blue hover:bg-theme-pale dark:hover:bg-blue-900/20 transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/librarian/books/${book._id}/edit`}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setConfirmDelete(book)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && books.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            Showing <span className="text-theme-navy dark:text-white font-bold">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
                            <span className="text-theme-navy dark:text-white font-bold">{Math.min(currentPage * PAGE_SIZE, books.length)}</span> of{' '}
                            <span className="text-theme-navy dark:text-white font-bold">{books.length}</span> books
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-theme-pale dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                        p === currentPage
                                            ? 'bg-theme-navy text-white shadow-sm'
                                            : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-theme-pale dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-theme-pale dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary bar */}
            {!loading && books.length > 0 && (
                <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>Total: <span className="font-bold text-theme-navy dark:text-white">{books.length}</span> books</span>
                    <span>Available: <span className="font-bold text-emerald-600 dark:text-emerald-400">{books.reduce((s, b) => s + (b.availableCopies || 0), 0)}</span></span>
                    <span>Total Copies: <span className="font-bold text-theme-navy dark:text-white">{books.reduce((s, b) => s + (b.totalCopies || 0), 0)}</span></span>
                </div>
            )}
        </div>
    );
};

export default BookManagementPage;
