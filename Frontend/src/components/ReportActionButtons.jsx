// ReportActionButtons.jsx

import { canEdit, canFinalize, canArchive, canRestore, canPermanentlyDelete } from '../utils/reportHelpers.js';
import {
    LockClosedIcon,
    PencilIcon,
    ArchiveBoxIcon,
    ArrowPathIcon,
    TrashIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const ReportActionButtons = ({
    report,
    onFinalize,
    onEdit,
    onArchive,
    onRestore,
    onPermanentDelete,
    onDownload,
    layout = 'row',
}) => {
    const wrapClass =
        layout === 'stack'
            ? 'flex flex-col gap-2.5 w-full'
            : 'flex flex-wrap items-center gap-2';

    const btn = `inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors focus:outline-none whitespace-nowrap ${
        layout === 'stack' ? 'w-full' : ''
    }`;

    return (
        <div className={wrapClass}>
            {/* Finalize */}
            {canFinalize(report) && (
                <button
                    onClick={() => onFinalize(report)}
                    className={`${btn} bg-theme-navy text-white hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-800`}
                >
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    Finalize
                </button>
            )}

            {/* Edit */}
            {canEdit(report) && (
                <button
                    onClick={() => onEdit(report)}
                    className={`${btn} bg-theme-pale text-theme-navy hover:bg-blue-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600`}
                >
                    <PencilIcon className="w-3.5 h-3.5" />
                    Edit
                </button>
            )}

            {/* Archive */}
            {canArchive(report) && (
                <button
                    onClick={() => onArchive(report)}
                    className={`${btn} bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900/50`}
                >
                    <ArchiveBoxIcon className="w-3.5 h-3.5" />
                    Archive
                </button>
            )}

            {/* Restore */}
            {canRestore(report) && (
                <button
                    onClick={() => onRestore(report)}
                    className={`${btn} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/50`}
                >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Restore
                </button>
            )}

            {/* Permanent Delete */}
            {canPermanentlyDelete(report) && (
                <button
                    onClick={() => onPermanentDelete(report)}
                    className={`${btn} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/50`}
                >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
                </button>
            )}

            {/* Download */}
            <button
                onClick={() => onDownload(report)}
                className={`${btn} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600`}
            >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Download CSV
            </button>
        </div>
    );
};

export default ReportActionButtons;