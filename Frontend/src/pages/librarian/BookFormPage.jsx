import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBook, createBook, updateBook } from '../../api/book.api.js';

/**
 * Librarian: Add / Edit Book
 *
 * Shared form for creating a new book or editing an existing one.
 * Route: /librarian/books/new (create) or /librarian/books/:id/edit (edit)
 */
const BookFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const BOOK_TYPES = ['Textbook', 'Reference', 'Novel', 'Magazine', 'Pastpaper', 'Fictional', 'Other'];
    const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

    const [formData, setFormData] = useState({
        name: '',
        author: '',
        grade: '',
        type: 'Textbook',
        img: '',
        description: '',
        value: 0,
        totalCopies: 1,
        availableCopies: 1,
        pdf: '',
        tag: '',
    });
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEditing) {
            const fetchBook = async () => {
                try {
                    const res = await getBook(id);
                    const book = res.data.data;
                    setFormData({
                        name: book.name || '',
                        author: book.author || '',
                        grade: book.grade || '',
                        type: book.type || 'Textbook',
                        img: book.img || '',
                        description: book.description || '',
                        value: book.value || 0,
                        totalCopies: book.totalCopies || 1,
                        availableCopies: book.availableCopies || 1,
                        pdf: book.pdf || '',
                        tag: book.tag?.join(', ') || '',
                    });
                } catch {
                    toast.error('Failed to load book data.');
                } finally {
                    setLoading(false);
                }
            };
            fetchBook();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.author.trim() || !formData.grade) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                totalCopies: Number(formData.totalCopies),
                availableCopies: Number(formData.availableCopies),
                tag: formData.tag
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t),
            };

            if (isEditing) {
                await updateBook(id, payload);
                toast.success('Book updated successfully.');
            } else {
                await createBook(payload);
                toast.success('Book created successfully.');
            }
            navigate('/librarian/books');
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} book.`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 space-y-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const inputClass =
        'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-theme-pale/50 focus:border-theme-blue transition-all';

    const labelClass = 'block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2';

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

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-theme-navy dark:text-white tracking-tight uppercase">
                    {isEditing ? 'Edit Book' : 'Add New Book'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    {isEditing ? 'Update the book details below.' : 'Fill in the details to add a new book to the catalog.'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {/* Name */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Book Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter book title" required className={inputClass} />
                    </div>

                    {/* Author */}
                    <div>
                        <label className={labelClass}>Author *</label>
                        <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Enter author name" required className={inputClass} />
                    </div>

                    {/* Grade */}
                    <div>
                        <label className={labelClass}>Grade *</label>
                        <select name="grade" value={formData.grade} onChange={handleChange} required className={`${inputClass} cursor-pointer`}>
                            <option value="">Select grade</option>
                            {GRADES.map((g) => (
                                <option key={g} value={g}>Grade {g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className={labelClass}>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                            {BOOK_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Value */}
                    <div>
                        <label className={labelClass}>Value (Rs.)</label>
                        <input type="number" name="value" value={formData.value} onChange={handleChange} min="0" step="0.01" className={inputClass} />
                    </div>

                    {/* Total Copies */}
                    <div>
                        <label className={labelClass}>Total Copies</label>
                        <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleChange} min="0" className={inputClass} />
                    </div>

                    {/* Available Copies */}
                    <div>
                        <label className={labelClass}>Available Copies</label>
                        <input type="number" name="availableCopies" value={formData.availableCopies} onChange={handleChange} min="0" className={inputClass} />
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Image URL</label>
                        <input type="url" name="img" value={formData.img} onChange={handleChange} placeholder="https://example.com/book-cover.jpg" className={inputClass} />
                    </div>

                    {/* PDF URL */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>PDF URL</label>
                        <input type="url" name="pdf" value={formData.pdf} onChange={handleChange} placeholder="https://example.com/book.pdf" className={inputClass} />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter a brief description of the book..."
                            rows={4}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Tags (comma-separated)</label>
                        <input type="text" name="tag" value={formData.tag} onChange={handleChange} placeholder="math, science, grade-10" className={inputClass} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-theme-navy text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                </svg>
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEditing ? 'Update Book' : 'Create Book'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/librarian/books')}
                        className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookFormPage;
