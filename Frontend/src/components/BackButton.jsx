import React from 'react';

const BackButton = ({ label = 'Back', onClick, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-theme-navy mb-6 transition ${className}`}
        >
            <span aria-hidden="true">←</span>
            <span>{label}</span>
        </button>
    );
};

export default BackButton;