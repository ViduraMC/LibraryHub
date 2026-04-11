// reportHelpers.js
// Helper functions to check what actions are allowed on a report
// Based on the report's status and isFinalized flag

// Can edit only if draft and active
export const canEdit = (report) =>
    !report.isFinalized && report.status === 'active';

// Can finalize only if draft and active
export const canFinalize = (report) =>
    !report.isFinalized && report.status === 'active';

// Can archive only if active
export const canArchive = (report) =>
    report.status === 'active';

// Can restore only if archived
export const canRestore = (report) =>
    report.status === 'archived';

// Can permanently delete only if archived
export const canPermanentlyDelete = (report) =>
    report.status === 'archived';

// Format date nicely → "Jan 15, 2025"
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date + time → "Jan 15, 2025, 3:42 PM"
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Capitalize first letter → "weekly" to "Weekly"
export const formatType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
};

// Relative time — "2 hours ago", "3 days ago", "just now"
// On hover the full date is shown via title attribute
export const timeAgo = (dateStr) => {
    if (!dateStr) return '—';

    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Returns Tailwind classes for report type badge
// Weekly → Blue, Monthly → Green, Custom → Indigo
export const getTypeBadgeClass = (type) => {
    const classes = {
        weekly:  'bg-blue-50 text-blue-700 border border-blue-200',
        monthly: 'bg-green-50 text-green-700 border border-green-200',
        custom:  'bg-indigo-50 text-indigo-700 border border-indigo-200',
    };
    return classes[type] || 'bg-slate-100 text-slate-600 border border-slate-200';
};