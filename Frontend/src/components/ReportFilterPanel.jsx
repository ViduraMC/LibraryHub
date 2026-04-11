// ReportFilterPanel.jsx
// Search and filter bar for the reports list

const ReportFilterPanel = ({
    search,
    onSearch,
    typeFilter,
    onTypeFilter,
    statusFilter,
    onStatusFilter,
    dateFrom,
    onDateFrom,
    dateTo,
    onDateTo,
    onReset,
}) => {
    return (
        <div className="bg-theme-pale/40 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-2xl p-4 mb-6 transition-colors">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search reports by title..."
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    />
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Type
                    </label>
                    <select
                        value={typeFilter}
                        onChange={(e) => onTypeFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    >
                        <option value="">All Types</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="finalized">Finalized</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Period From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFrom(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    />
                </div>

                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Period To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateTo(e.target.value)}
                        className="px-3 py-2 text-sm border border-blue-100 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-pale focus:border-theme-navy"
                    />
                </div>

                <button
                    onClick={onReset}
                    className="px-4 py-2 text-sm text-theme-navy dark:text-white border border-theme-navy dark:border-slate-500 rounded-lg hover:bg-theme-pale dark:hover:bg-slate-700 transition-colors h-[42px]"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default ReportFilterPanel;