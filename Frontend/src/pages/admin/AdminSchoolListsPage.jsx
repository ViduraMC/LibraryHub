import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
    uploadStudentList,
    uploadTeacherList,
    getStudentList,
    getTeacherList,
    updateSchoolListEntry,
    deleteSchoolListEntry,
    clearSchoolList,
} from '../../api/admin.api.js';

/**
 * Admin: School Lists Management — full CRUD with CSV validation.
 * Upload, view, edit, delete, and clear student/teacher lists.
 */
const AdminSchoolListsPage = () => {
    const [tab, setTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const fileRef = useRef(null);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchLists = async () => {
        setLoading(true);
        try {
            const [stuRes, tchRes] = await Promise.allSettled([
                getStudentList(),
                getTeacherList(),
            ]);
            if (stuRes.status === 'fulfilled') setStudents(stuRes.value.data.students || []);
            if (tchRes.status === 'fulfilled') setTeachers(tchRes.value.data.teachers || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLists(); }, []);

    // --- Upload ---
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const uploadFn = tab === 'students' ? uploadStudentList : uploadTeacherList;
            const res = await uploadFn(formData);
            const { added = 0, skipped = 0 } = res.data;
            toast.success(`Imported ${added} ${tab} record${added !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}.`);
            fetchLists();
        } catch (err) {
            const msg = err.response?.data?.message || 'CSV upload failed. Make sure the file format is correct.';
            toast.error(msg);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    // --- Edit ---
    const startEditing = (entry) => {
        setEditingId(entry._id);
        setEditForm({
            fullName: entry.fullName,
            grade: entry.grade || '',
            classRoom: entry.classRoom || '',
            subject: entry.subject || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleUpdate = async (id) => {
        setProcessingId(id);
        try {
            await updateSchoolListEntry(id, editForm);
            toast.success('Entry updated.');
            setEditingId(null);
            fetchLists();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Delete ---
    const handleDelete = async (entry) => {
        const confirmed = window.confirm(
            `Delete ${entry.fullName} (${entry.schoolId}) from the ${tab} list?`
        );
        if (!confirmed) return;

        setProcessingId(entry._id);
        try {
            await deleteSchoolListEntry(entry._id);
            toast.success('Entry deleted.');
            fetchLists();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Clear All ---
    const handleClearAll = async () => {
        const type = tab === 'students' ? 'student' : 'teacher';
        const count = tab === 'students' ? students.length : teachers.length;
        const confirmed = window.confirm(
            `Are you sure you want to clear ALL ${count} ${tab} from the list?\n\nThis will permanently delete all ${tab} records. You can re-upload a CSV afterward.`
        );
        if (!confirmed) return;

        try {
            const res = await clearSchoolList(type);
            toast.success(res.data.message);
            fetchLists();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Clear failed.');
        }
    };

    const rows = tab === 'students' ? students : teachers;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-theme-navy tracking-tight uppercase">
                        School Lists
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Upload CSV files to set which students and teachers can register for library membership.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Clear All button */}
                    {rows.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all border border-red-100"
                        >
                            Clear All {tab === 'students' ? 'Students' : 'Teachers'}
                        </button>
                    )}

                    {/* Upload button */}
                    <label className="cursor-pointer">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <span
                            className={`inline-flex items-center gap-2 bg-theme-navy text-white px-5 py-2.5 rounded-xl font-bold hover:bg-theme-blue transition-all text-sm ${
                                uploading ? 'opacity-60 pointer-events-none' : ''
                            }`}
                        >
                            {uploading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            )}
                            Upload {tab === 'students' ? 'Student' : 'Teacher'} CSV
                        </span>
                    </label>
                </div>
            </div>

            {/* CSV format hint */}
            <div className="bg-theme-pale/40 border border-theme-pale rounded-2xl px-5 py-3.5 text-sm text-theme-navy">
                <p className="font-bold text-xs mb-1">Expected CSV columns for {tab}:</p>
                {tab === 'students' ? (
                    <code className="text-xs text-slate-600">schoolId, fullName, grade, classRoom</code>
                ) : (
                    <code className="text-xs text-slate-600">schoolId, fullName, subject</code>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                    The <strong>schoolId</strong> column is used to verify membership applications automatically.
                    Uploading a student CSV to the teacher list (or vice versa) will be rejected.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-theme-pale/30 p-1.5 rounded-xl border border-theme-pale/50 w-fit">
                {['students', 'teachers'].map((t) => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); cancelEditing(); }}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                            tab === t
                                ? 'bg-theme-navy text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {t} ({t === 'students' ? students.length : teachers.length})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-theme-pale/30">
                                {(tab === 'students'
                                    ? ['School ID', 'Name', 'Grade', 'Class', 'Actions']
                                    : ['School ID', 'Name', 'Subject', 'Actions']
                                ).map((h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-5 py-5">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 italic text-sm">
                                        No records found. Upload a CSV file above to get started.
                                    </td>
                                </tr>
                            ) : tab === 'students' ? (
                                rows.map((s) => (
                                    <tr key={s._id} className="hover:bg-theme-pale/10 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-theme-blue">{s.schoolId}</td>
                                        <td className="px-5 py-3.5">
                                            {editingId === s._id ? (
                                                <input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20" />
                                            ) : (
                                                <span className="font-semibold text-slate-800 text-sm">{s.fullName}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {editingId === s._id ? (
                                                <input value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-theme-blue/20" />
                                            ) : (
                                                <span className="text-sm text-slate-500">{s.grade}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {editingId === s._id ? (
                                                <input value={editForm.classRoom} onChange={(e) => setEditForm({ ...editForm, classRoom: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-theme-blue/20" />
                                            ) : (
                                                <span className="text-sm text-slate-500">{s.classRoom}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <RowActions
                                                entry={s}
                                                editingId={editingId}
                                                processingId={processingId}
                                                onEdit={() => startEditing(s)}
                                                onSave={() => handleUpdate(s._id)}
                                                onCancel={cancelEditing}
                                                onDelete={() => handleDelete(s)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                rows.map((t) => (
                                    <tr key={t._id} className="hover:bg-theme-pale/10 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-theme-blue">{t.schoolId}</td>
                                        <td className="px-5 py-3.5">
                                            {editingId === t._id ? (
                                                <input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20" />
                                            ) : (
                                                <span className="font-semibold text-slate-800 text-sm">{t.fullName}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {editingId === t._id ? (
                                                <input value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-theme-blue/20" />
                                            ) : (
                                                <span className="text-sm text-slate-500">{t.subject}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <RowActions
                                                entry={t}
                                                editingId={editingId}
                                                processingId={processingId}
                                                onEdit={() => startEditing(t)}
                                                onSave={() => handleUpdate(t._id)}
                                                onCancel={cancelEditing}
                                                onDelete={() => handleDelete(t)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Row-level action buttons (edit/save/cancel/delete)
const RowActions = ({ entry, editingId, processingId, onEdit, onSave, onCancel, onDelete }) => {
    if (editingId === entry._id) {
        return (
            <div className="flex items-center gap-1.5">
                <button onClick={onSave} disabled={processingId === entry._id}
                    className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {processingId === entry._id ? '...' : 'Save'}
                </button>
                <button onClick={onCancel}
                    className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <button onClick={onEdit}
                className="px-2.5 py-1 bg-theme-pale text-theme-navy text-xs font-bold rounded-lg hover:bg-blue-100 transition-all">
                Edit
            </button>
            <button onClick={onDelete} disabled={processingId === entry._id}
                className="px-2.5 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50">
                {processingId === entry._id ? '...' : 'Delete'}
            </button>
        </div>
    );
};

export default AdminSchoolListsPage;
