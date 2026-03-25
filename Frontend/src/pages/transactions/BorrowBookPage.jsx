import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance.js';
import { borrowBook } from '../../api/transactions.api.js';
import { searchUserByMembershipId } from '../../api/admin.api.js';

// Librarians use this page to issue a book to a member.
//
// How it works:
//  1. Librarian types the member's Membership ID (e.g. ST-26-0001)
//     → We look up the user directly via GET /api/admin/user/search?membershipId=...
//     This resolves the user's Mongo _id regardless of borrow history.
//
//  2. Librarian types the Book ID (e.g. BK001) → resolved via GET /api/books
//     and matched by the human bookId string stored on the Book document.
//
//  3. Once both are resolved to Mongo _ids, we POST /api/transactions/borrow
//     with { userId: <mongo_id>, bookId: <mongo_id> }.
const BorrowBookPage = () => {
    const navigate = useNavigate();

    // What the librarian types
    const [membershipIdInput, setMembershipIdInput] = useState('');
    const [bookIdInput, setBookIdInput] = useState('');

    // Resolved records after lookup
    const [resolvedUser, setResolvedUser] = useState(null);
    const [resolvedBook, setResolvedBook] = useState(null);

    // Loading states per field
    const [lookingUpUser, setLookingUpUser] = useState(false);
    const [lookingUpBook, setLookingUpBook] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Look up a member by their membershipId — single API call, always works
    const lookupUser = useCallback(async () => {
        if (!membershipIdInput.trim()) return;
        setLookingUpUser(true);
        setResolvedUser(null);
        try {
            const res = await searchUserByMembershipId(membershipIdInput.trim());
            const user = res.data.user;
            setResolvedUser({
                _id: user._id,
                fullName: user.fullName,
                role: user.role,
                membershipId: user.membershipId,
            });
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not look up the member.';
            toast.error(msg);
        } finally {
            setLookingUpUser(false);
        }
    }, [membershipIdInput]);

    // Look up a book by its human-readable bookId (e.g. BK001).
    // The backend stores bookId as a String field on the Book model.
    // We use GET /api/books with free-text search and match manually.
    const lookupBook = useCallback(async () => {
        if (!bookIdInput.trim()) return;
        setLookingUpBook(true);
        setResolvedBook(null);
        try {
            const res = await axiosInstance.get('/books', {
                params: { q: bookIdInput.trim(), limit: 50 }
            });
            const books = res.data.data || [];
            // Exact match on the bookId string field
            const match = books.find(
                (b) => b.bookId?.toLowerCase() === bookIdInput.trim().toLowerCase()
            );
            if (match) {
                setResolvedBook(match);
            } else {
                toast.error(`No book found with ID: ${bookIdInput}`);
            }
        } catch {
            toast.error('Could not look up the book. Please check the ID and try again.');
        } finally {
            setLookingUpBook(false);
        }
    }, [bookIdInput]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resolvedUser || !resolvedBook) {
            toast.error('Please look up and confirm both the member and the book first.');
            return;
        }

        if (!resolvedUser._id) {
            toast.error('Member resolved but no system ID found. Please contact the admin.');
            return;
        }

        setSubmitting(true);
        try {
            // Backend expects MongoDB _id for both userId and bookId
            await borrowBook({
                userId: resolvedUser._id,
                bookId: resolvedBook._id,
            });
            toast.success('Book issued successfully!');
            navigate('/transactions');
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
                    Enter the Membership ID and Book ID to look them up, then confirm the issue.
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-theme-blue to-theme-navy" />

                <form onSubmit={handleSubmit} className="p-10 space-y-8">

                    {/* Step 1: Member lookup */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Step 1 — Member's Membership ID
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={membershipIdInput}
                                onChange={(e) => {
                                    setMembershipIdInput(e.target.value);
                                    setResolvedUser(null); // reset if typing changes
                                }}
                                placeholder="e.g. ST-26-0001"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-mono focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                            <button
                                type="button"
                                onClick={lookupUser}
                                disabled={lookingUpUser || !membershipIdInput.trim()}
                                className="px-5 py-4 bg-theme-pale text-theme-blue rounded-2xl font-bold text-sm hover:bg-theme-blue hover:text-white transition-all disabled:opacity-50"
                            >
                                {lookingUpUser ? (
                                    <span className="w-4 h-4 border-2 border-theme-blue border-t-white rounded-full animate-spin inline-block" />
                                ) : 'Look Up'}
                            </button>
                        </div>
                        {/* Member preview card */}
                        {resolvedUser && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{resolvedUser.fullName}</p>
                                    <p className="text-xs text-emerald-600 uppercase font-bold">{resolvedUser.role} · {resolvedUser.membershipId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Book lookup */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Step 2 — Book ID
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={bookIdInput}
                                onChange={(e) => {
                                    setBookIdInput(e.target.value);
                                    setResolvedBook(null);
                                }}
                                placeholder="e.g. BK001"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-mono focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                            <button
                                type="button"
                                onClick={lookupBook}
                                disabled={lookingUpBook || !bookIdInput.trim()}
                                className="px-5 py-4 bg-theme-pale text-theme-blue rounded-2xl font-bold text-sm hover:bg-theme-blue hover:text-white transition-all disabled:opacity-50"
                            >
                                {lookingUpBook ? (
                                    <span className="w-4 h-4 border-2 border-theme-blue border-t-white rounded-full animate-spin inline-block" />
                                ) : 'Look Up'}
                            </button>
                        </div>
                        {/* Book preview card */}
                        {resolvedBook && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{resolvedBook.name}</p>
                                    <p className="text-xs text-emerald-600 font-bold">
                                        By {resolvedBook.author} · {resolvedBook.availableCopies} {resolvedBook.availableCopies === 1 ? 'copy' : 'copies'} available
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
                            disabled={submitting || !resolvedUser || !resolvedBook}
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
