import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { getAllReservations, deleteReservation } from "../../api/bookReservation.api.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const BOOK_TYPES = ["Textbook", "Reference", "Novel", "Magazine", "Pastpaper", "Fictional", "Other"];

const TYPE_COLORS = {
  Textbook: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Reference: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Novel: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Magazine: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Pastpaper: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Fictional: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Other: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const STATUS_CONFIG = {
  waiting: { label: "Waiting", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-500" },
  reserved: { label: "Reserved", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", dot: "bg-blue-600" },
  collected: { label: "Collected", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", dot: "bg-green-600" },
  expired: { label: "Expired", badge: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", badge: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", dot: "bg-green-600" },
};

const ALL_STATUSES = ["waiting", "reserved", "collected", "expired", "cancelled", "completed"];

// ── Icons ─────────────────────────────────────────────────────────────────────
const BookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const TrashIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EyeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const UserIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CalendarIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const TagIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const groupByBook = (reservations) => {
  const map = new Map();
  for (const r of reservations) {
    const bookId = r.bookId?._id || "unknown";
    if (!map.has(bookId)) {
      map.set(bookId, { book: r.bookId, reservations: [] });
    }
    map.get(bookId).reservations.push(r);
  }
  return Array.from(map.values());
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonBookCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="p-5 flex gap-4">
      <div className="w-[52px] h-[68px] rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-2 mt-1">
          {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />)}
        </div>
      </div>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear }) => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-400">
      <BookIcon className="w-7 h-7" />
    </div>
    <p className="font-semibold text-[#0d1b4b] dark:text-white mb-1">No reservations found</p>
    <p className="text-sm text-center max-w-xs text-slate-400 dark:text-slate-500">
      {hasFilters ? "No reservations match your current filters." : "No reservations exist in the system yet."}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
        Clear all filters
      </button>
    )}
  </div>
);

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        Page <span className="text-[#0d1b4b] dark:text-white font-bold">{currentPage}</span> of{" "}
        <span className="text-[#0d1b4b] dark:text-white font-bold">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 hover:text-[#0d1b4b] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronLeftIcon />
        </button>
        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer
                ${p === currentPage
                  ? "bg-[#0d1b4b] text-white shadow-sm"
                  : "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 hover:text-[#0d1b4b]"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 hover:text-[#0d1b4b] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ reservation, onConfirm, onClose }) => {
  const studentName = reservation?.userId?.fullName || "this student";
  const bookName = reservation?.bookId?.name || "this book";
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <TrashIcon className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-center text-[#0d1b4b] dark:text-white font-bold text-lg mb-1">Delete Reservation?</h3>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-1">
          You are about to permanently delete the reservation for
        </p>
        <p className="text-center text-sm mb-1">
          <span className="font-bold text-[#0d1b4b] dark:text-white">{bookName}</span>
        </p>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
          by <span className="font-semibold text-[#0d1b4b] dark:text-white">{studentName}</span>.
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ reservation, onClose }) => {
  if (!reservation) return null;
  const book = reservation.bookId || {};
  const user = reservation.userId || {};
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#0d1b4b] px-6 pt-6 pb-5 flex gap-4 items-start">
          <div className="w-[56px] h-[72px] rounded-lg bg-blue-900/50 border border-white/10 flex items-center justify-center shrink-0 text-blue-300 overflow-hidden">
            {book.img
              ? <img src={book.img} alt={book.name} className="w-full h-full object-cover" />
              : <BookIcon className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${TYPE_COLORS[book.type] || TYPE_COLORS.Other}`}>
              {book.type || "Unknown"}
            </span>
            <h3 className="text-white font-extrabold text-base leading-snug">{book.name || "Unknown Book"}</h3>
            <p className="text-blue-300 text-xs mt-0.5">by {book.author || "Unknown"}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Status */}
          <div className="flex items-center gap-3 mb-5">
            <StatusBadge status={reservation.status} />
            {reservation.timeRemaining && reservation.status === "reserved" && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {reservation.timeRemaining}
              </span>
            )}
          </div>

          {/* Student info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Student / Member</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0d1b4b] dark:text-white">{user.fullName || "Unknown"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.studentId || user.membershipId || user.email || "No ID"}
                </p>
              </div>
            </div>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Reserved On", value: fmt(reservation.createdAt) },
              { label: "Expires", value: fmt(reservation.expiredDate) },
              { label: "Collected On", value: fmt(reservation.collectedDate) },
              { label: "Reservation ID", value: reservation._id?.slice(-8)?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-700 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#0d1b4b] dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {book.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold rounded-full">
                  <TagIcon />{tag}
                </span>
              ))}
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0d1b4b] text-white text-sm font-semibold hover:bg-[#162260] transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Reservation Row ───────────────────────────────────────────────────────────
const ReservationRow = ({ reservation, onView, onDeleteRequest, deleting }) => {
  const canDelete = ["completed", "cancelled", "expired"].includes(reservation.status);
  const user = reservation.userId || {};
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-xl group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-300 shrink-0">
        <UserIcon className="w-3.5 h-3.5" />
      </div>

      {/* Student info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0d1b4b] dark:text-white truncate">
          {user.fullName || "Unknown"}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
          {user.studentId || user.membershipId || user.email || "—"}
        </p>
      </div>

      {/* Date */}
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
        <CalendarIcon />
        {fmt(reservation.createdAt)}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={reservation.status} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onView(reservation)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0d1b4b] dark:hover:text-blue-300 hover:border-blue-300 transition-all cursor-pointer"
          title="View details">
          <EyeIcon />
        </button>
        {canDelete && (
          <button
            onClick={() => onDeleteRequest(reservation)}
            disabled={deleting === reservation._id}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete reservation">
            {deleting === reservation._id
              ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
              : <TrashIcon />}
          </button>
        )}

      </div>
    </div>
  );
};

// ── Inner Pagination (compact, used inside book cards) ────────────────────────
const InnerPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        Page <span className="font-bold text-[#0d1b4b] dark:text-white">{currentPage}</span> of{" "}
        <span className="font-bold text-[#0d1b4b] dark:text-white">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0d1b4b] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-semibold transition-all cursor-pointer
              ${p === currentPage
                ? "bg-[#0d1b4b] text-white shadow-sm"
                : "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0d1b4b]"}`}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-[#0d1b4b] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

const INNER_PAGE_SIZE = 5;

// ── Book Group Card ───────────────────────────────────────────────────────────
const BookGroupCard = ({ group, onView, onDeleteRequest, deleting }) => {
  const [expanded, setExpanded] = useState(false);
  const [innerPage, setInnerPage] = useState(1);
  const { book, reservations } = group;

  const handleToggle = () => {
    setExpanded((p) => {
      if (p) setInnerPage(1); // reset page on collapse
      return !p;
    });
  };

  // Status breakdown counts
  const statusCounts = useMemo(() => {
    const counts = {};
    for (const r of reservations) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }, [reservations]);

  const activeCount = (statusCounts.waiting || 0) + (statusCounts.reserved || 0);
  const waitingCount = statusCounts.waiting || 0;

  const innerTotalPages = Math.max(1, Math.ceil(reservations.length / INNER_PAGE_SIZE));
  const clampedInnerPage = Math.min(innerPage, innerTotalPages);
  const pagedReservations = reservations.slice(
    (clampedInnerPage - 1) * INNER_PAGE_SIZE,
    clampedInnerPage * INNER_PAGE_SIZE
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Book header row */}
      <button
        onClick={handleToggle}
        className="w-full text-left p-5 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
      >
        {/* Cover */}
        <div className="w-[52px] h-[68px] rounded-lg overflow-hidden shrink-0 bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-400 dark:text-blue-300">
          {book?.img
            ? <img src={book.img} alt={book.name} className="w-full h-full object-cover" />
            : <BookIcon className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${TYPE_COLORS[book?.type] || TYPE_COLORS.Other}`}>
                {book?.type || "Unknown"}
              </span>
              <h3 className="text-[15px] font-bold text-[#0d1b4b] dark:text-white leading-snug">
                {book?.name || "Unknown Book"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {book?.author || "Unknown"}</p>
            </div>

            {/* Total count badge + chevron */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-[#0d1b4b]/10 dark:bg-white/10 text-[#0d1b4b] dark:text-white text-xs font-bold">
                {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </div>
          </div>

          {/* Status pills row */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              if (!cfg) return null;
              return (
                <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>

          {/* Waiting list callout */}
          {waitingCount > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {waitingCount} in waiting list
            </div>
          )}
        </div>
      </button>

      {/* Expandable reservation list */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Sub-header */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Reservations
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {activeCount > 0 && <span className="font-semibold text-blue-600 dark:text-blue-400">{activeCount} active</span>}
              {activeCount > 0 && waitingCount > 0 && " · "}
              {waitingCount > 0 && <span className="font-semibold text-amber-600 dark:text-amber-400">{waitingCount} waiting</span>}
            </p>
          </div>

          {/* Rows */}
          <div className="px-1 py-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {pagedReservations.map((r) => (
              <ReservationRow
                key={r._id}
                reservation={r}
                onView={onView}
                onDeleteRequest={onDeleteRequest}
                deleting={deleting}
              />
            ))}
          </div>

          {/* Inner pagination */}
          <InnerPagination
            currentPage={clampedInnerPage}
            totalPages={innerTotalPages}
            onPageChange={setInnerPage}
          />
        </div>
      )}
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ reservations }) => {
  const counts = useMemo(() => {
    const c = { total: reservations.length };
    for (const s of ALL_STATUSES) c[s] = 0;
    for (const r of reservations) {
      if (c[r.status] !== undefined) c[r.status]++;
    }
    return c;
  }, [reservations]);

  const stats = [
    { label: "Total", value: counts.total, color: "text-[#0d1b4b] dark:text-white", bg: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" },
    { label: "Waiting", value: counts.waiting, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" },
    { label: "Reserved", value: counts.reserved, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" },
    { label: "Collected", value: counts.collected, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" },
    { label: "Expired", value: counts.expired, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600" },
    { label: "Cancelled", value: counts.cancelled, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-6">
      {stats.map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl px-3 py-3 text-center ${bg}`}>
          <p className={`text-2xl font-extrabold leading-none ${color}`}>{value}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8; // book groups per page

export default function LibrarianReservationPage() {
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Modals
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch all reservations once; filtering is done client-side
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllReservations();
      setAllReservations(res.data?.data || []);
    } catch {
      setError("Failed to load reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filter + group
  const filteredReservations = useMemo(() => {
    let list = allReservations;
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    if (filterType) list = list.filter((r) => r.bookId?.type === filterType);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((r) =>
        r.bookId?.name?.toLowerCase().includes(q) ||
        r.userId?.fullName?.toLowerCase().includes(q) ||
        r.userId?.studentId?.toLowerCase().includes(q) ||
        r.userId?.membershipId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allReservations, filterStatus, filterType, debouncedSearch]);

  const groupedBooks = useMemo(() => groupByBook(filteredReservations), [filteredReservations]);

  const totalPages = Math.max(1, Math.ceil(groupedBooks.length / PAGE_SIZE));
  const pagedGroups = groupedBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = filterStatus || filterType || debouncedSearch;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterType("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    setDeleting(target._id);
    try {
      await deleteReservation(target._id);
      setAllReservations((prev) => prev.filter((r) => r._id !== target._id));
    } catch {
      setError("Failed to delete reservation. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const activeFilterCount = [filterStatus, filterType, debouncedSearch].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900">

      {/* Modals */}
      {detailTarget && <DetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} />}
      {deleteTarget && (
        <DeleteModal
          reservation={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-[#0d1b4b] pt-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Library Hub · Librarian</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">All Reservations</h1>
              <p className="mt-1.5 text-sm text-slate-400">View, manage, and delete reservations across all books.</p>
            </div>
            {!loading && (
              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Books</p>
                <p className="text-3xl font-extrabold text-white leading-none">{groupedBooks.length}</p>
              </div>
            )}
          </div>

          {/* Search + filter bar */}
          <div className="mt-6 mb-0 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by book title or student name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                ${showFilters || activeFilterCount > 0
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:text-white"}`}>
              <FilterIcon />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[9px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 mb-0 bg-white/10 border border-white/15 rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer appearance-none"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" className="bg-[#0d1b4b]">All statuses</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-[#0d1b4b] capitalize">{STATUS_CONFIG[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Book Type</label>
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer appearance-none"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" className="bg-[#0d1b4b]">All types</option>
                  {BOOK_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0d1b4b]">{t}</option>
                  ))}
                </select>
              </div>
              {(filterStatus || filterType) && (
                <button onClick={clearFilters} className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer underline underline-offset-2 pb-0.5">
                  Clear all
                </button>
              )}
            </div>
          )}

          <div className="h-5" />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-7 pb-16">

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-4 flex items-center gap-3 mb-6">
            <p className="flex-1 text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            <button onClick={() => { setError(null); fetchData(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer underline">
              <RefreshIcon className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && !loading && (
          <div className="flex flex-wrap gap-2 mb-5">
            {debouncedSearch && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                "{debouncedSearch}"
                <button onClick={() => setSearch("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                Status: {STATUS_CONFIG[filterStatus]?.label}
                <button onClick={() => setFilterStatus("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterType && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                Type: {filterType}
                <button onClick={() => setFilterType("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonBookCard key={i} />)}
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Stats bar — always shown when data is available */}
            {allReservations.length > 0 && (
              <StatsBar reservations={allReservations} />
            )}

            {/* Empty state */}
            {groupedBooks.length === 0
              ? <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
              : (
                <>
                  {/* Results label */}
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    {groupedBooks.length} book{groupedBooks.length !== 1 ? "s" : ""} · {filteredReservations.length} reservation{filteredReservations.length !== 1 ? "s" : ""}
                  </p>

                  {/* Book group cards */}
                  <div className="space-y-3">
                    {pagedGroups.map((group) => (
                      <BookGroupCard
                        key={group.book?._id || "unknown"}
                        group={group}
                        onView={setDetailTarget}
                        onDeleteRequest={setDeleteTarget}
                        deleting={deleting}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )
            }
          </>
        )}
      </div>
    </div>
  );
}