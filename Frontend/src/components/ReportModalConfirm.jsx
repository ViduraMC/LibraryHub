// ReportModalConfirm.jsx

const ReportModalConfirm = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    confirmStyle = 'danger',
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const confirmColors = {
        danger:
            'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500',
        warning:
            'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-500 dark:hover:bg-yellow-400',
        primary:
            'bg-theme-navy hover:bg-blue-900 text-white dark:bg-blue-700 dark:hover:bg-blue-600',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h2 className="text-lg font-bold text-theme-navy dark:text-white mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-colors ${confirmColors[confirmStyle]}`}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModalConfirm;