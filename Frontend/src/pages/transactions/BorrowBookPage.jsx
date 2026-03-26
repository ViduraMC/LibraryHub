import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance.js';
import { borrowBook } from '../../api/transactions.api.js';
import { searchMembers } from '../../api/admin.api.js';

/**
 * BorrowBookPage — Librarian issues a book to a member
 *
 * Features:
 *   - Live search-as-you-type for both member and book
 *   - Type a name, membership ID, book title, or book ID
 *   - Dropdown suggestions appear after 2+ characters
 *   - Click a suggestion to select
 *   - Confirm Issue sends POST /api/transactions/borrow
 */

// Debounce helper — delays API calls until user stops typing
const useDebounce = (value, delay) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

const BorrowBookPage = () => {
    const navigate = useNavigate();

    // Member search
    const [memberQuery, setMemberQuery] = useState('');
    const [memberResults, setMemberResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberLoading, setMemberLoading] = useState(false);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const memberRef = useRef(null);

    // Book search
    const [bookQuery, setBookQuery] = useState('');
    const [bookResults, setBookResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookLoading, setBookLoading] = useState(false);
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const bookRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);

    const debouncedMemberQuery = useDebounce(memberQuery, 300);
    const debouncedBookQuery = useDebounce(bookQuery, 300);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (memberRef.current && !memberRef.current.contains(e.target)) {
                setShowMemberDropdown(false);
            }
            if (bookRef.current && !bookRef.current.contains(e.target)) {
                setShowBookDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch member suggestions
    useEffect(() => {
        if (selectedMember) return; // don't re-search after selection
        if (debouncedMemberQuery.trim().length < 2) {
            setMemberResults([]);
            return;
        }
        const fetchMembers = async () => {
            setMemberLoading(true);
            try {
                const res = await searchMembers(debouncedMemberQuery.trim());
                setMemberResults(res.data.users || []);
                setShowMemberDropdown(true);
            } catch {
                setMemberResults([]);
            } finally {
                setMemberLoading(false);
            }
        };
        fetchMembers();
    }, [debouncedMemberQuery, selectedMember]);

    // Fetch book suggestions
    useEffect(() => {
        if (selectedBook) return;
        if (debouncedBookQuery.trim().length < 2) {
            setBookResults([]);
            return;
        }
        const fetchBooks = async () => {
            setBookLoading(true);
            try {
                const res = await axiosInstance.get('/books', {
                    params: { q: debouncedBookQuery.trim(), limit: 10 },
                });
                setBookResults(res.data.data || []);
                setShowBookDropdown(true);
            } catch {
                setBookResults([]);
            } finally {
                setBookLoading(false);
            }
        };
        fetchBooks();
    }, [debouncedBookQuery, selectedBook]);

    // Select handlers
    const selectMember = (user) => {
        setSelectedMember(user);
        setMemberQuery(user.fullName);
        setShowMemberDropdown(false);
    };

    const selectBook = (book) => {
        setSelectedBook(book);
        setBookQuery(book.name);
        setShowBookDropdown(false);
    };

    // Clear handlers
    const clearMember = () => {
        setSelectedMember(null);
        setMemberQuery('');
        setMemberResults([]);
    };

    const clearBook = () => {
        setSelectedBook(null);
        setBookQuery('');
        setBookResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMember || !selectedBook) {
            toast.error('Please search and select both a member and a book first.');
            return;
        }

        if (!selectedMember._id) {
            toast.error('Member resolved but no system ID found. Please contact the admin.');
            return;
        }

        setSubmitting(true);
        try {
            await borrowBook({
                userId: selectedMember._id,
                bookId: selectedBook._id,
            });
            toast.success('Book issued successfully!');
            navigate('/librarian/transactions');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                    Issue Book
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    Search for a member and a book by name or ID, then confirm the issue.
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-theme-blue to-theme-navy" />

                <form onSubmit={handleSubmit} className="p-10 space-y-8">

                    {/* Step 1: Member search */}
                    <div ref={memberRef} className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Step 1 — Find Member
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={memberQuery}
                                onChange={(e) => {
                                    setMemberQuery(e.target.value);
                                    setSelectedMember(null);
                                    setShowMemberDropdown(true);
                                }}
                                onFocus={() => {
                                    if (memberResults.length > 0 && !selectedMember) {
                                        setShowMemberDropdown(true);
                                    }
                                }}
                                placeholder="Type member name or membership ID (e.g. 'John' or 'ST-26-0001')"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-12 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                            {selectedMember && (
                                <button
                                    type="button"
                                    onClick={clearMember}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                            {memberLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="w-5 h-5 border-2 border-theme-blue/30 border-t-theme-blue rounded-full animate-spin inline-block" />
                                </div>
                            )}
                        </div>

                        {/* Dropdown results */}
                        {showMemberDropdown && memberResults.length > 0 && !selectedMember && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                {memberResults.map((u) => (
                                    <button
                                        key={u._id}
                                        type="button"
                                        onClick={() => selectMember(u)}
                                        className="w-full px-5 py-3 text-left hover:bg-theme-pale/50 transition-colors flex items-center justify-between gap-3 border-b border-slate-50 last:border-0"
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{u.fullName}</p>
                                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">{u.role} · {u.membershipId}</p>
                                        </div>
                                        {!u.isActive && (
                                            <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">INACTIVE</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showMemberDropdown && debouncedMemberQuery.trim().length >= 2 && memberResults.length === 0 && !memberLoading && !selectedMember && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg px-5 py-4 text-sm text-slate-400 italic">
                                No members found matching "{debouncedMemberQuery}"
                            </div>
                        )}

                        {/* Selected member preview */}
                        {selectedMember && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{selectedMember.fullName}</p>
                                    <p className="text-xs text-emerald-600 uppercase font-bold">{selectedMember.role} · {selectedMember.membershipId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Book search */}
                    <div ref={bookRef} className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Step 2 — Find Book
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={bookQuery}
                                onChange={(e) => {
                                    setBookQuery(e.target.value);
                                    setSelectedBook(null);
                                    setShowBookDropdown(true);
                                }}
                                onFocus={() => {
                                    if (bookResults.length > 0 && !selectedBook) {
                                        setShowBookDropdown(true);
                                    }
                                }}
                                placeholder="Type book title, author, or book ID (e.g. 'Harry Potter' or 'BK001')"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-12 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                            {selectedBook && (
                                <button
                                    type="button"
                                    onClick={clearBook}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                            {bookLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="w-5 h-5 border-2 border-theme-blue/30 border-t-theme-blue rounded-full animate-spin inline-block" />
                                </div>
                            )}
                        </div>

                        {/* Dropdown results */}
                        {showBookDropdown && bookResults.length > 0 && !selectedBook && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                {bookResults.map((b) => (
                                    <button
                                        key={b._id}
                                        type="button"
                                        onClick={() => selectBook(b)}
                                        className="w-full px-5 py-3 text-left hover:bg-theme-pale/50 transition-colors flex items-center justify-between gap-3 border-b border-slate-50 last:border-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-800 truncate">{b.name}</p>
                                            <p className="text-[11px] text-slate-400">
                                                By {b.author} · <span className="font-mono">{b.bookId}</span> · {b.availableCopies}/{b.totalCopies} available
                                            </p>
                                        </div>
                                        {b.availableCopies === 0 && (
                                            <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold shrink-0">UNAVAILABLE</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showBookDropdown && debouncedBookQuery.trim().length >= 2 && bookResults.length === 0 && !bookLoading && !selectedBook && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg px-5 py-4 text-sm text-slate-400 italic">
                                No books found matching "{debouncedBookQuery}"
                            </div>
                        )}

                        {/* Selected book preview */}
                        {selectedBook && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{selectedBook.name}</p>
                                    <p className="text-xs text-emerald-600 font-bold">
                                        By {selectedBook.author} · <span className="font-mono">{selectedBook.bookId}</span> · {selectedBook.availableCopies} {selectedBook.availableCopies === 1 ? 'copy' : 'copies'} available
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pre-issue checklist */}
                    <div className="bg-theme-pale/50 border border-theme-pale rounded-2xl px-5 py-4 text-sm text-theme-navy">
                        <p className="font-bold mb-1">Before confirming:</p>
                        <ul className="text-slate-600 text-xs space-y-1 list-disc list-inside">
                            <li>Verify the member's physical ID card matches the name shown above</li>
                            <li>Confirm the book copy is in hand and ready to issue</li>
                            <li>Due date will be set to 14 days from today</li>
                        </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/transactions')}
                            className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedMember || !selectedBook}
                            className="flex-[2] py-4 bg-theme-navy text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Confirm Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowBookPage;
