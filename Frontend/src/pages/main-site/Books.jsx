import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { fetchAllBooksForReservation, createReservation } from "../../api/bookReservation.api.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const BOOK_TYPES = ["Textbook", "Reference", "Novel", "Magazine", "Pastpaper", "Fictional", "Other"];

const TYPE_COLORS = {
  Textbook:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Reference: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Novel:     "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Magazine:  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Pastpaper: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Fictional: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Other:     "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const BookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

const CheckCircleIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const TagIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CopyIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="h-44 bg-slate-200 dark:bg-slate-700" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-2" />
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-400">
      <BookIcon className="w-7 h-7" />
    </div>
    <p className="font-semibold text-[#0d1b4b] dark:text-white mb-1">No books found</p>
    <p className="text-sm text-center max-w-xs text-slate-400 dark:text-slate-500">
      {hasFilters
        ? "No books match your current filters."
        : "No books are available in the library right now."}
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

// ── Reservation Modal ─────────────────────────────────────────────────────────
const ReservationModal = ({ book, onClose }) => {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReserve = async () => {
    setStatus("loading");
    try {
      await createReservation({ bookId: book._id });
      setStatus("success");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to make reservation. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const isAvailable = book.availableCopies > 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={status !== "loading" ? onClose : undefined} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Success state */}
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
            <div className="text-green-500 mb-4">
              <CheckCircleIcon className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0d1b4b] dark:text-white mb-2">
              {isAvailable ? "Book Reserved!" : "Added to Waitlist!"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
              <span className="font-semibold text-[#0d1b4b] dark:text-white">{book.name}</span>
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">
              {isAvailable
                ? "Please collect your book within 24 hours before the reservation expires."
                : "You've been added to the waiting list. Keep track of the waiting list"}
            </p>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0d1b4b] text-white text-sm font-semibold hover:bg-[#162260] transition-colors cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header — always dark navy */}
            <div className="bg-[#0d1b4b] px-6 pt-6 pb-5 flex gap-4 items-start">
              <div className="w-[56px] h-[72px] rounded-lg bg-blue-900/50 border border-white/10 flex items-center justify-center shrink-0 text-blue-300">
                {book.img
                  ? <img src={book.img} alt={book.name} className="w-full h-full object-cover rounded-lg" />
                  : <BookIcon className="w-6 h-6" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${TYPE_COLORS[book.type] || TYPE_COLORS.Other}`}>
                  {book.type}
                </span>
                <h3 className="text-white font-extrabold text-base leading-snug">{book.name}</h3>
                <p className="text-blue-300 text-xs mt-0.5">by {book.author}</p>
              </div>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5">
                <XIcon />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Availability banner */}
              <div className={`rounded-xl px-4 py-3 mb-5 flex items-center gap-3 ${isAvailable
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"}`}>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isAvailable ? "bg-green-500" : "bg-amber-400"}`} />
                <div>
                  <p className={`text-xs font-bold ${isAvailable ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                    {isAvailable ? "Available Now" : "Currently Unavailable"}
                  </p>
                  <p className={`text-[11px] ${isAvailable ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500"}`}>
                    {isAvailable
                      ? `${book.availableCopies} of ${book.totalCopies} copies available`
                      : "All copies are checked out. You can join the waitlist."}
                  </p>
                </div>
              </div>

              {/* Book details grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Grade", value: book.grade },
                  { label: "Value", value: book.value ? `LKR ${book.value.toLocaleString()}` : "N/A" },
                  { label: "Total Copies", value: book.totalCopies },
                  { label: "Book ID", value: book.bookId },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-700 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-[#0d1b4b] dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {book.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {book.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold rounded-full">
                      <TagIcon />{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleReserve} disabled={status === "loading"}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer
                    ${isAvailable
                      ? "bg-[#0d1b4b] text-white hover:bg-[#162260]"
                      : "bg-amber-500 text-white hover:bg-amber-600"}
                    disabled:opacity-60 disabled:cursor-not-allowed`}>
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                      </svg>
                      {isAvailable ? "Reserving…" : "Joining…"}
                    </span>
                  ) : isAvailable ? "Reserve Now" : "Join Waitlist"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

// ── Book Card ─────────────────────────────────────────────────────────────────
const BookCard = ({ book, onReserve }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Cover image area */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
        {book.img ? (
          <img src={book.img} alt={book.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-blue-300">
            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-slate-600 flex items-center justify-center">
              <BookIcon className="w-7 h-7 text-blue-400 dark:text-blue-300" />
            </div>
            <span className="text-[10px] text-slate-300 dark:text-slate-500 font-medium">No cover</span>
          </div>
        )}
        {/* Available badge */}
        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
          ${isAvailable
            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
          {isAvailable ? "Available" : "Unavailable"}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${TYPE_COLORS[book.type] || TYPE_COLORS.Other}`}>
          {book.type}
        </span>

        <h3 className="text-[14px] font-bold text-[#0d1b4b] dark:text-white leading-snug mb-0.5 line-clamp-2">{book.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">by {book.author}</p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Grade: <span className="text-slate-600 dark:text-slate-300 font-semibold">{book.grade}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <CopyIcon />
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{book.availableCopies}/{book.totalCopies}</span> copies
          </span>
          {book.value > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              LKR <span className="text-slate-600 dark:text-slate-300 font-semibold">{book.value.toLocaleString()}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {book.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-full">
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-semibold rounded-full">
                +{book.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Reserve button */}
        <button onClick={() => onReserve(book)}
          className={`mt-auto w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer
            ${isAvailable
              ? "bg-[#0d1b4b] text-white hover:bg-[#162260]"
              : "bg-amber-500 text-white hover:bg-amber-600"}`}>
          {isAvailable ? "Reserve" : "Join Waitlist"}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: PAGE_SIZE,
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(filterGrade && { grade: filterGrade }),
        ...(filterType && { type: filterType }),
        ...(filterAuthor && { author: filterAuthor }),
        ...(availableOnly && { available: true }),
      };
      const res = await fetchAllBooksForReservation(params);
      setBooks(res.data?.data || []);
      setTotalBooks(res.data?.meta?.total || 0);
    } catch (err) {
      console.error("Books fetch error:", err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterGrade, filterType, filterAuthor, availableOnly]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const totalPages = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE));
  const hasActiveFilters = filterGrade || filterType || filterAuthor || availableOnly;

  const clearFilters = () => {
    setFilterGrade("");
    setFilterType("");
    setFilterAuthor("");
    setAvailableOnly(false);
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
      {selectedBook && (
        <ReservationModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      {/* ── Header — always dark navy, no dark: variants needed ── */}
      <div className="bg-[#0d1b4b] pt-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Library Hub</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse Books</h1>
              <p className="mt-1.5 text-sm text-slate-400">Search and reserve books from the library collection.</p>
            </div>
            {!loading && (
              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                <p className="text-3xl font-extrabold text-white leading-none">{totalBooks}</p>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="mt-6 mb-0 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by title, author, or book ID…"
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
                ${showFilters || hasActiveFilters
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15 hover:text-white"}`}>
              <FilterIcon />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[9px] font-extrabold flex items-center justify-center">
                  {[filterGrade, filterType, filterAuthor, availableOnly].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 mb-0 bg-white/10 border border-white/15 rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</label>
                <input
                  type="text"
                  placeholder="e.g. 10"
                  value={filterGrade}
                  onChange={(e) => { setFilterGrade(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
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
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</label>
                <input
                  type="text"
                  placeholder="Author name…"
                  value={filterAuthor}
                  onChange={(e) => { setFilterAuthor(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
                <div
                  onClick={() => { setAvailableOnly((p) => !p); setCurrentPage(1); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${availableOnly ? "bg-green-500" : "bg-white/20"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${availableOnly ? "left-5" : "left-0.5"}`} />
                </div>
                <span className="text-sm font-semibold text-slate-300">Available only</span>
              </label>
              {hasActiveFilters && (
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
            <button onClick={fetchBooks} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 cursor-pointer underline">Retry</button>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && !loading && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filterGrade && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                Grade: {filterGrade}
                <button onClick={() => setFilterGrade("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterType && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                Type: {filterType}
                <button onClick={() => setFilterType("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterAuthor && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                Author: {filterAuthor}
                <button onClick={() => setFilterAuthor("")} className="text-slate-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
            {availableOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs font-semibold text-green-700 dark:text-green-400 shadow-sm">
                Available only
                <button onClick={() => setAvailableOnly(false)} className="text-green-400 hover:text-red-500 cursor-pointer"><XIcon className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : books.length === 0
              ? <EmptyState hasFilters={!!hasActiveFilters || !!debouncedSearch} onClear={clearFilters} />
              : books.map((book) => (
                <BookCard key={book._id} book={book} onReserve={setSelectedBook} />
              ))
          }
        </div>

        {/* Pagination */}
        {!loading && books.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}