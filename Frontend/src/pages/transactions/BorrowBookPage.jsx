import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { borrowBook } from '../../api/transactions.api.js';

// Librarians use this page to manually issue a book to a member.
// The librarian enters the member's Membership ID (e.g. ST-26-0001)
// and the Book ID (e.g. BK001) — not the raw Mongo _id.
// The backend resolves these to their actual database records.
const BorrowBookPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        membershipId: '',
        bookId: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await borrowBook({
                membershipId: formData.membershipId.trim().toUpperCase(),
                bookId: formData.bookId.trim(),
            });
            toast.success('Book successfully issued!');
            navigate('/transactions');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not issue the book. Please check the IDs and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                    Issue Book
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    Enter the member's Membership ID and the Book ID to issue a book.
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Top colour bar */}
                <div className="h-1 w-full bg-gradient-to-r from-theme-blue to-theme-navy" />

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        {/* Membership ID */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Member's Membership ID
                            </label>
                            <input
                                name="membershipId"
                                type="text"
                                value={formData.membershipId}
                                onChange={handleChange}
                                required
                                placeholder="e.g. ST-26-0001"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                                Students: ST-YY-XXXX  •  Teachers: TH-YY-XXXX
                            </p>
                        </div>

                        {/* Book ID */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Book ID
                            </label>
                            <input
                                name="bookId"
                                type="text"
                                value={formData.bookId}
                                onChange={handleChange}
                                required
                                placeholder="e.g. BK001"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                                Found on the book's spine label or in the book catalogue.
                            </p>
                        </div>
                    </div>

                    {/* Reminder notice */}
                    <div className="bg-theme-pale/50 border border-theme-pale rounded-2xl px-5 py-4 text-sm text-theme-navy">
                        <p className="font-bold mb-1">Before issuing:</p>
                        <ul className="text-slate-600 text-xs space-y-1 list-disc list-inside">
                            <li>Confirm the member's ID card matches the Membership ID</li>
                            <li>Check the physical book copy is available on the shelf</li>
                            <li>Record is automatically dated — due in 14 days</li>
                        </ul>
                    </div>

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
                            disabled={loading}
                            className="flex-[2] py-4 bg-theme-navy text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Confirm Issue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowBookPage;
