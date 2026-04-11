import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Librarian Profile Page
 * 
 * Displays the current librarian's profile information.
 * Shows personal details, account info, and activity stats.
 */
const LibrarianProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-blue mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-theme-navy rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {user.fullName}
                        </h1>
                        <p className="text-theme-blue dark:text-theme-pale font-semibold uppercase text-sm">
                            {user.role} • {user.librarianId || 'LIB-XXX'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        Personal Information
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Full Name
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.fullName || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Email
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Phone
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.phone || 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Address
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.address || 'Not provided'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        Account Information
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Librarian ID
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.librarianId || 'Not assigned'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Account Status
                            </label>
                            <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Member Since
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Last Login
                            </label>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Activity Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-theme-blue dark:text-theme-pale">
                            {user.noOfBorrowedBooks || 0}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Books Currently Borrowed
                        </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-theme-blue dark:text-theme-pale">
                            {/* You might want to add total transactions count from API */}
                            --
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Total Transactions
                        </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-theme-blue dark:text-theme-pale">
                            {/* You might want to add active reservations count from API */}
                            --
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Active Reservations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibrarianProfilePage;
