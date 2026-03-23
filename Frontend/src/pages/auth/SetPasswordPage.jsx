import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setPassword } from '../../api/auth.api.js';

/**
 * Interface for users to establish their first password after account approval.
 * Accessible via verification link: /set-password?token=<verification_token>
 */
const SetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing security token. Please use the link provided in your email.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('The passwords you entered do not match.');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password security requirement: Must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await setPassword(token, formData.password);
            toast.success('Your password has been successfully configured. You may now log in.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Verification link may have expired. Please contact the librarian.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-meridian-pale p-6">
            <div className="bg-meridian-white rounded-3xl shadow-2xl shadow-meridian-navy/5 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-1 w-full bg-gradient-to-r from-meridian-navy to-meridian-blue"></div>
                
                <div className="p-10">
                    {/* header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-meridian-pale rounded-2xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-meridian-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-meridian-navy">Security Setup</h1>
                        <p className="text-slate-500 mt-2 italic">Define the password for your library account.</p>
                    </div>

                    {!token ? (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                            <p className="text-red-700 font-bold text-lg mb-2">Invalid Access Link</p>
                            <p className="text-red-600/70 text-sm leading-relaxed">
                                This security interface is restricted. Please use the unique link sent to your verified email address.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Minimum 6 characters"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-meridian-blue/20 focus:border-meridian-blue transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Verify your new password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-meridian-blue/20 focus:border-meridian-blue transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-meridian-navy text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-meridian-navy/10 flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <span>Activate Account</span>
                                )}
                            </button>
                            
                            <p className="text-xs text-center text-slate-400 mt-6 px-4">
                                By activating, you agree to comply with the library's resource usage and borrowing policies.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetPasswordPage;
