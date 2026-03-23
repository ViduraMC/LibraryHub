import { useNavigate } from 'react-router-dom';

/**
 * Access restriction page displayed for role-based authorization failures.
 */
const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-meridian-pale p-8">
            <div className="max-w-md w-full text-center bg-white p-12 rounded-3xl shadow-xl shadow-meridian-navy/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                
                <h1 className="text-5xl font-black text-meridian-navy mb-4 tracking-tight">403</h1>
                <p className="text-2xl font-bold text-slate-800 mb-2">Restricted Access</p>
                <p className="text-slate-500 mb-10 leading-relaxed">
                    Account credentials verified, but your assigned role does not grant permission to view this resource.
                </p>
                
                <div className="space-y-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-8 py-4 bg-meridian-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-meridian-navy/10 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Return to Safety</span>
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full px-8 py-3 bg-white text-meridian-blue border border-meridian-pale rounded-xl font-semibold hover:bg-meridian-pale transition-all"
                    >
                        Switch Account
                    </button>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest font-bold">
                Security Perimeter • Meridian Library System
            </p>
        </div>
    );
};

export default UnauthorizedPage;
