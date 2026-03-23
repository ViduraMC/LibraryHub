import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { borrowBook } from '../../api/transactions.api.js';

/**
 * Interface for Librarians to issue books to students/teachers.
 * Validates availability and borrowing limits on the server side.
 */
const BorrowBookPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ userId: '', bookId: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await borrowBook(formData);
            toast.success('Book successfully issued!');
            navigate('/transactions');
        } catch (err) {
            const msg = err.response?.data?.message || 'Checkout failed. Please verify IDs and availability.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h1 className="text-4xl font-black text-meridian-navy tracking-tight">Issue New Book</h1>
                <p className="text-slate-500 mt-2">Initialize a borrowing transaction for a library member.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-1 w-full bg-gradient-to-r from-meridian-blue to-meridian-navy"></div>
                
                <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-8">
                    <div className="bg-meridian-pale/30 rounded-3xl p-8 border border-meridian-pale space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
                                Member Identifier (System ID)
                            </label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                required
                                placeholder="Enter the user's Mongo ID"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-meridian-blue/10 focus:border-meridian-blue transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">
                                * Librarian: Ensure the user has no overdue books or outstanding fines.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
                                Book Identifier (System ID)
                            </label>
                            <input
                                type="text"
                                value={formData.bookId}
                                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                                required
                                placeholder="Enter the book's Mongo ID"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-meridian-blue/10 focus:border-meridian-blue transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
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
                            className="flex-[2] py-4 bg-meridian-navy text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-meridian-navy/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Complete Checkout</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-meridian-blue shadow-sm shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-meridian-navy">Checkout Protocol</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Upon checkout, the system automatically calculates a 14-day due date. 
                            Users will be notified via email for upcoming and overdue returns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BorrowBookPage;
