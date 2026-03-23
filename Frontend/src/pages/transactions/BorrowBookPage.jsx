import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { borrowBook } from '../../api/transactions.api.js';

/**
 * Interface for librarians to issue resources.
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
            toast.error(err.response?.data?.message || 'Checkout failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">Issue Resource</h1>
                <p className="text-slate-500 mt-2 text-sm italic">Assign library material to an active member.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-1 w-full bg-gradient-to-r from-theme-blue to-theme-navy"></div>
                
                <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-8">
                    <div className="bg-theme-pale/30 rounded-3xl p-8 border border-theme-pale space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Member System ID</label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                required
                                placeholder="Enter Mongo ID"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Book System ID</label>
                            <input
                                type="text"
                                value={formData.bookId}
                                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                                required
                                placeholder="Enter Mongo ID"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-theme-blue/10 focus:border-theme-blue transition-all"
                            />
                        </div>
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
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <span>Complete Issue</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowBookPage;
