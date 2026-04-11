import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getAdminProfile,
    updateAdminProfile,
    updateAdminPassword,
    getSystemStats,
} from '../../api/adminProfile.api.js';

// ── Icons ─────────────────────────────────────────────────────────────────────
const UserIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const LockIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const EditIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const CheckIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const XIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const EyeIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
const PhoneIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const MapPinIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const MailIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
);
const IdCardIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 9h4M14 12h4M14 15h2" /></svg>
);
const ShieldIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const AlertIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

// ── Phone validation ──────────────────────────────────────────────────────────
const validatePhone = (value) => {
    if (!value || value.trim() === '') return null;
    const digits = value.replace(/[\s\-().+]/g, '');
    if (!/^\d+$/.test(digits)) return 'Phone number must contain digits only.';
    if (digits.length !== 10) return 'Phone number must be exactly 10 digits.';
    return null;
};

// ── Reusable sub-components ───────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
        <span className="mt-0.5 text-slate-400 dark:text-slate-500 shrink-0"><Icon className="w-4 h-4" /></span>
        <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-[14px] font-medium text-[#0d1b4b] dark:text-white break-words">
                {value || <span className="text-slate-300 dark:text-slate-600 font-normal italic">Not set</span>}
            </p>
        </div>
    </div>
);

const InputField = ({ label, id, value, onChange, placeholder, disabled = false, hint, error }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <input
            id={id} type="text" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800
                text-[14px] text-[#0d1b4b] dark:text-white placeholder-slate-300 dark:placeholder-slate-600
                focus:outline-none focus:ring-2
                disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed
                transition-all duration-150
                ${error ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-600 focus:border-blue-400 focus:ring-blue-500/30'}`}
        />
        {error ? <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1"><AlertIcon className="w-3 h-3 shrink-0" />{error}</p>
            : hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
);

const PasswordField = ({ label, id, value, onChange, placeholder, hint }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[14px] text-[#0d1b4b] dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-150"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer" tabIndex={-1}>
                    {show ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
            </div>
            {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
    );
};

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-[#0d1b4b] dark:text-blue-400"><Icon className="w-4 h-4" /></span>
            <h2 className="text-[13px] font-bold text-[#0d1b4b] dark:text-white uppercase tracking-widest">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
    </div>
);

const StatCard = ({ label, value, color = 'blue', sub }) => {
    const colorMap = {
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
        slate: 'from-slate-500 to-slate-600',
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shrink-0`}>
                <span className="text-white text-lg font-extrabold">{value}</span>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-[#0d1b4b] dark:text-white">{label}</p>
                {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex gap-5 items-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-20" />
            ))}
        </div>
        {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                {[1, 2, 3].map((j) => (
                    <div key={j} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                ))}
            </div>
        ))}
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // edit
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [phoneError, setPhoneError] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const [profileRes, statsRes] = await Promise.all([
                getAdminProfile(),
                getSystemStats(),
            ]);
            setProfile(profileRes.data.admin);
            setStats(statsRes.data.stats);
            setPhone(profileRes.data.admin.phone || '');
            setAddress(profileRes.data.admin.address || '');
        } catch {
            setFetchError('Failed to load admin profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        setPhone(val);
        setPhoneError(validatePhone(val));
    };

    const handleCancelEdit = () => {
        setPhone(profile?.phone || '');
        setAddress(profile?.address || '');
        setPhoneError(null);
        setProfileError(null);
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        const phoneErr = validatePhone(phone);
        if (phoneErr) { setPhoneError(phoneErr); return; }
        setProfileSaving(true);
        setProfileError(null);
        try {
            const res = await updateAdminProfile({ phone, address });
            setProfile((prev) => ({ ...prev, ...res.data.admin }));
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleSavePassword = async () => {
        setPasswordError(null);
        if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All password fields are required.'); return; }
        if (newPassword !== confirmPassword) { setPasswordError('New password and confirmation do not match.'); return; }
        if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
        setPasswordSaving(true);
        try {
            await updateAdminPassword({ currentPassword, newPassword });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            toast.success('Password changed successfully');
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    const initials = profile?.fullName
        ? profile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-[#0d1b4b] pt-10 pb-0">
                <div className="max-w-3xl mx-auto px-6">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Library Hub</p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Profile</h1>
                    <p className="mt-1.5 text-sm text-slate-400 mb-7">System administrator dashboard and account settings.</p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-3xl mx-auto px-6 py-7 pb-16 space-y-5">
                {loading && <ProfileSkeleton />}

                {fetchError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-4 flex items-center gap-3">
                        <AlertIcon className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="flex-1 text-red-700 dark:text-red-400 text-sm font-medium">{fetchError}</p>
                        <button onClick={fetchData} className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 cursor-pointer">Retry</button>
                    </div>
                )}

                {!loading && !fetchError && profile && (
                    <>
                        {/* Avatar + Name */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex gap-5 items-center">
                            <div className="w-20 h-20 rounded-3xl shrink-0 overflow-hidden bg-[#0d1b4b] flex items-center justify-center">
                                {profile.profileImageURL ? (
                                    <img src={profile.profileImageURL} alt={profile.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-extrabold text-white">{initials}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl font-extrabold text-[#0d1b4b] dark:text-white truncate">{profile.fullName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        <ShieldIcon className="w-3 h-3" /> Administrator
                                    </span>
                                    <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">{profile.adminId}</span>
                                </div>
                            </div>
                        </div>

                        {/* System Stats */}
                        {stats && (
                            <SectionCard title="System Overview" icon={ShieldIcon}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <StatCard label="Total Users" value={stats.users.total} color="blue" sub={`${stats.users.students} students, ${stats.users.teachers} teachers`} />
                                    <StatCard label="Librarians" value={stats.users.librarians} color="purple" />
                                    <StatCard label="Total Books" value={stats.books.total} color="emerald" />
                                    <StatCard label="Active Borrows" value={stats.transactions.active} color="blue" sub={`${stats.transactions.total} total`} />
                                    <StatCard label="Overdue" value={stats.transactions.overdue} color="red" />
                                    <StatCard label="Unpaid Fines" value={stats.fines.unpaid} color="amber" sub={`Rs. ${stats.fines.unpaidAmount}`} />
                                    <StatCard label="Pending Memberships" value={stats.pendingMemberships} color="purple" />
                                    <StatCard label="Active Reservations" value={stats.activeReservations} color="emerald" />
                                </div>
                            </SectionCard>
                        )}

                        {/* Account Info */}
                        <SectionCard title="Account Details" icon={IdCardIcon}>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                <InfoRow icon={IdCardIcon} label="Admin ID" value={profile.adminId} />
                                <InfoRow icon={MailIcon} label="Email" value={profile.email} />
                                <InfoRow icon={UserIcon} label="Status" value={profile.isActive ? 'Active' : 'Inactive'} />
                                <InfoRow icon={UserIcon} label="Member Since" value={fmtDate(profile.createdAt)} />
                                <InfoRow icon={UserIcon} label="Last Login" value={fmtDateTime(profile.lastLoginAt)} />
                            </div>
                        </SectionCard>

                        {/* Contact Info (editable) */}
                        <SectionCard title="Contact Info" icon={PhoneIcon}>
                            {!isEditing ? (
                                <>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                        <InfoRow icon={PhoneIcon} label="Phone" value={profile.phone} />
                                        <InfoRow icon={MapPinIcon} label="Address" value={profile.address} />
                                    </div>
                                    <button onClick={() => setIsEditing(true)}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0d1b4b] dark:border-blue-500 text-[#0d1b4b] dark:text-blue-400 text-sm font-semibold hover:bg-[#0d1b4b] hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-150 cursor-pointer">
                                        <EditIcon className="w-3.5 h-3.5" /> Edit Contact Info
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <InputField id="phone" label="Phone" value={phone} onChange={handlePhoneChange}
                                        placeholder="e.g. 0771234567" hint="Must be exactly 10 digits" error={phoneError} />
                                    <InputField id="address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. 45 Peradeniya Road, Kandy" hint="Your current address" />

                                    {profileError && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                                            <AlertIcon className="w-4 h-4 shrink-0" />{profileError}
                                        </div>
                                    )}

                                    <div className="flex gap-2.5 pt-1">
                                        <button onClick={handleSaveProfile} disabled={profileSaving || !!phoneError}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d1b4b] text-white text-sm font-semibold hover:bg-[#162660] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer">
                                            {profileSaving ? (
                                                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>Saving…</>
                                            ) : (
                                                <><CheckIcon className="w-3.5 h-3.5" />Save Changes</>
                                            )}
                                        </button>
                                        <button onClick={handleCancelEdit} disabled={profileSaving}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer">
                                            <XIcon className="w-3.5 h-3.5" />Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        {/* Change Password */}
                        <SectionCard title="Change Password" icon={LockIcon}>
                            <div className="space-y-4">
                                <PasswordField id="currentPassword" label="Current Password" value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" />
                                <PasswordField id="newPassword" label="New Password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                                    hint="Must be different from your current password" />
                                <PasswordField id="confirmPassword" label="Confirm New Password" value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat the new password" />

                                {passwordError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                                        <AlertIcon className="w-4 h-4 shrink-0" />{passwordError}
                                    </div>
                                )}

                                <button onClick={handleSavePassword} disabled={passwordSaving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d1b4b] text-white text-sm font-semibold hover:bg-[#162660] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer">
                                    {passwordSaving ? (
                                        <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>Updating…</>
                                    ) : (
                                        <><LockIcon className="w-3.5 h-3.5" />Update Password</>
                                    )}
                                </button>
                            </div>
                        </SectionCard>
                    </>
                )}
            </div>
        </div>
    );
}
