import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { submitMembershipRequest } from '../../api/auth.api.js';

/**
 * Public registration page for students and teachers to apply for library membership.
 *
 * Flow:
 *   1. Applicant fills this form and submits.
 *   2. Backend auto-verifies schoolId against the uploaded school list.
 *      - If found  → status becomes "verified" (librarian reviews next)
 *      - If NOT found → status becomes "rejected" immediately with reason
 *   3. Librarian approves / rejects verified applications.
 *   4. On approval, an email with a password-setup link is sent to the applicant.
 */
const RegisterPage = () => {
    const [applicantType, setApplicantType] = useState('student');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        schoolId: '',
        fullName: '',
        email: '',
        phone: '',
        // student-only
        grade: '',
        classRoom: '',
        guardianName: '',
        guardianPhone: '',
        // teacher-only
        subject: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (type) => {
        setApplicantType(type);
        // Clear fields that are specific to the other type
        setForm((prev) => ({
            ...prev,
            grade: '',
            classRoom: '',
            guardianName: '',
            guardianPhone: '',
            subject: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            applicantType,
            schoolId: form.schoolId.trim(),
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
        };

        if (applicantType === 'student') {
            payload.grade = form.grade.trim();
            payload.classRoom = form.classRoom.trim();
            payload.guardianName = form.guardianName.trim();
            payload.guardianPhone = form.guardianPhone.trim();
        } else {
            payload.subject = form.subject.trim();
        }

        setLoading(true);
        try {
            await submitMembershipRequest(payload);
            setSubmitted(true);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                'Submission failed. Please try again or contact the library.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // --- Success state ---
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-theme-pale p-6">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-theme-navy mb-3">Application Submitted!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Your membership application has been received. The librarian will review it
                        and you will receive an email notification once a decision has been made.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-theme-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    // --- Form state ---
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-theme-white">
            {/* Left side: info panel */}
            <div className="hidden lg:flex lg:w-2/5 bg-theme-navy flex-col justify-center p-14">
                <div className="text-white">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-theme-pale rounded-xl flex items-center justify-center">
                            <div className="w-5 h-5 bg-theme-navy rounded-sm"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight uppercase">LibraryHub</span>
                    </div>

                    <h1 className="text-4xl font-black leading-snug mb-6">
                        Join Our <br />
                        <span className="text-theme-pale">Library Community</span>
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed mb-10">
                        Apply for a library membership to access our full collection of books,
                        manage borrows, and track your reading history.
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: '01', text: 'Fill in your school details below' },
                            { step: '02', text: 'Your ID is verified against the school register' },
                            { step: '03', text: 'Librarian reviews and approves your application' },
                            { step: '04', text: 'You get an email to set up your password' },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex items-start gap-4">
                                <span className="text-xs font-black text-theme-blue bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
                                    {step}
                                </span>
                                <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side: form */}
            <div className="flex-1 overflow-y-auto flex items-start justify-center p-8 lg:p-12">
                <div className="w-full max-w-lg">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-theme-navy">Membership Application</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Fill in your details accurately. Your school ID will be verified automatically.
                        </p>
                    </div>

                    {/* Applicant type toggle */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-8">
                        {['student', 'teacher'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleTypeChange(type)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                                    applicantType === type
                                        ? 'bg-theme-navy text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* --- Common fields --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    School ID *
                                </label>
                                <input
                                    name="schoolId"
                                    value={form.schoolId}
                                    onChange={handleChange}
                                    required
                                    placeholder={applicantType === 'student' ? 'e.g. S2024001' : 'e.g. T2024001'}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="As on school register"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Email Address *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Phone Number *
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="07XXXXXXXX"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                />
                            </div>
                        </div>

                        {/* --- Student-only fields --- */}
                        {applicantType === 'student' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            Grade *
                                        </label>
                                        <input
                                            name="grade"
                                            value={form.grade}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. 10"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            Class / Section *
                                        </label>
                                        <input
                                            name="classRoom"
                                            value={form.classRoom}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. 10A"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 pb-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Guardian Details
                                    </p>
                                    <div className="h-px bg-slate-100 mt-1.5"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            Guardian Name *
                                        </label>
                                        <input
                                            name="guardianName"
                                            value={form.guardianName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Parent / Guardian"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            Guardian Phone *
                                        </label>
                                        <input
                                            name="guardianPhone"
                                            type="tel"
                                            value={form.guardianPhone}
                                            onChange={handleChange}
                                            required
                                            placeholder="07XXXXXXXX"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- Teacher-only fields --- */}
                        {applicantType === 'teacher' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Subject *
                                </label>
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Mathematics"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-theme-blue/20 focus:border-theme-blue transition-all"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-theme-navy text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-theme-navy/10 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-theme-blue font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
