import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBook } from '../../api/book.api.js';

/**
 * Librarian: Book Details
 *
 * Displays full details for a single book.
 * Accessible from the Book Management table via "View".
 */
const BookDetailsPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await getBook(id);
                setBook(res.data.data);
            } catch {
                toast.error('Failed to load book details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8">
                    <div className="flex gap-8">
                        <div className="w-40 h-56 bg-slate-100 dark:bg-slate-700 rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-4">
                            <div className="h-6 w-2/3 bg-slate-100 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700 rounded" />
                            <div className="h-20 w-full bg-slate-100 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                <svg className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="font-semibold text-lg">Book not found</p>
                <Link to="/librarian/books" className="mt-3 text-sm font-bold text-theme-blue hover:underline">
                    Back to Book Management
                </Link>
            </div>
        );
    }

    const details = [
        { label: 'Author', value: book.author },
        { label: 'Grade', value: `Grade ${book.grade}` },
        { label: 'Type', value: book.type },
        { label: 'Description', value: book.description || 'No description provided.' },
        { label: 'Book ID', value: book.bookId, mono: true },
        { label: 'Total Copies', value: book.totalCopies },
        { label: 'Available Copies', value: book.availableCopies },
        { label: 'Value', value: book.value ? `Rs. ${book.value}` : 'Not set' },
        { label: 'Tags', value: book.tag?.length > 0 ? book.tag.join(', ') : 'None' },
    ];

    return (
        <div className="space-y-8">
            {/* Back link */}
            <Link
                to="/librarian/books"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-theme-navy dark:hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Books
            </Link>

            {/* Main card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Book cover */}
                        <div className="shrink-0">
                            {book.img ? (
                                <img src={book.img} alt={book.name} className="w-40 h-56 rounded-2xl object-cover border border-slate-100 dark:border-slate-600 shadow-sm" />
                            ) : (
                                <div className="w-40 h-56 rounded-2xl bg-theme-pale dark:bg-slate-700 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-theme-blue dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Book info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-3xl font-black text-theme-navy dark:text-white tracking-tight">
                                        {book.name}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">by {book.author}</p>
                                </div>

                                <Link
                                    to={`/librarian/books/${book._id}/edit`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-theme-navy text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Book
                                </Link>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-theme-pale dark:bg-blue-900/30 text-theme-navy dark:text-blue-300 border border-theme-pale dark:border-blue-800">
                                    Grade {book.grade}
                                </span>
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {book.type}
                                </span>
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                                    book.availableCopies > 0
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                                        : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300'
                                }`}>
                                    {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
                                </span>
                            </div>

                            {/* Detail rows */}
                            <div className="mt-6 space-y-3">
                                {details.map(({ label, value, mono }) => (
                                    <div key={label} className="flex items-start gap-4 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-32 shrink-0 pt-0.5">{label}</span>
                                        <span className={`text-sm text-slate-700 dark:text-slate-200 ${mono ? 'font-mono text-theme-blue dark:text-blue-400' : ''}`}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* PDF link */}
                            {book.pdf && (
                                <div className="mt-6">
                                    <a
                                        href={book.pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-theme-pale dark:bg-blue-900/30 text-theme-navy dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-theme-pale/70 dark:hover:bg-blue-900/50 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        View PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;
