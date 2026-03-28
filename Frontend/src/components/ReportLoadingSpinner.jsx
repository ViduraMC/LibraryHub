// ReportLoadingSpinner.jsx

const ReportLoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-theme-pale dark:border-slate-700 border-t-theme-navy dark:border-t-blue-500 rounded-full animate-spin" />

            {/* Message */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {message}
            </p>
        </div>
    );
};

export default ReportLoadingSpinner;