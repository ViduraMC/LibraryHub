import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
    uploadStudentList,
    uploadTeacherList,
    getStudentList,
    getTeacherList,
} from '../../api/admin.api.js';

/**
 * Admin: School Lists Management
 *
 * Two tabs — Students and Teachers.
 * Each tab allows:
 *   - CSV file upload (sets the allowed-applicants list)
 *   - View the currently uploaded records in a table
 *
 * The uploaded list is used by the backend to auto-verify membership applications.
 * If a student/teacher's schoolId is NOT in this list, their application is auto-rejected.
 */
const AdminSchoolListsPage = () => {
    const [tab, setTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

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

    useEffect(() => {
        fetchLists();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const uploadFn = tab === 'students' ? uploadStudentList : uploadTeacherList;
            const res = await uploadFn(formData);
            // Backend response shape: { added, skipped, totalRows }
            const { added = 0, skipped = 0 } = res.data;
            toast.success(`Imported ${added} ${tab} record${added !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}.`);
            fetchLists();
        } catch (err) {
            const msg = err.response?.data?.message || 'CSV upload failed. Make sure the file format is correct.';
            toast.error(msg);
        } finally {
            setUploading(false);
            // reset the file input so same file can be re-uploaded if needed
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const rows = tab === 'students' ? students : teachers;

    return (
        <div className="space-y-8">
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

                {/* Upload button */}
                <label className="shrink-0 cursor-pointer">
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <span
                        className={`inline-flex items-center gap-2 bg-theme-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 text-sm ${
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

            {/* CSV format hint — columns must match what schoolList controller reads from the CSV */}
            <div className="bg-theme-pale border border-theme-blue/10 rounded-2xl px-6 py-4 text-sm text-theme-navy">
                <p className="font-bold mb-1">Expected CSV columns for {tab}:</p>
                {tab === 'students' ? (
                    <code className="text-xs text-slate-600">schoolId, fullName, grade, classRoom</code>
                ) : (
                    <code className="text-xs text-slate-600">schoolId, fullName, subject</code>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                    The <strong>schoolId</strong> column is used to verify membership applications automatically.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                {['students', 'teachers'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                            tab === t
                                ? 'bg-theme-navy text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {t} ({t === 'students' ? students.length : teachers.length})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {tab === 'students'
                                    ? ['School ID', 'Name', 'Grade', 'Class'].map((h) => (
                                          <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                              {h}
                                          </th>
                                      ))
                                    : ['School ID', 'Name', 'Subject'].map((h) => (
                                          <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                              {h}
                                          </th>
                                      ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-20 text-center text-slate-400 italic text-sm"
                                    >
                                        No records found. Upload a CSV file above to get started.
                                    </td>
                                </tr>
                            ) : tab === 'students' ? (
                                rows.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-theme-blue">{s.schoolId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{s.fullName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{s.grade}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{s.classRoom}</td>
                                    </tr>
                                ))
                            ) : (
                                rows.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-theme-blue">{t.schoolId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{t.fullName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{t.subject}</td>
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

export default AdminSchoolListsPage;
