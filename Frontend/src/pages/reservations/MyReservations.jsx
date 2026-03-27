import { useState, useEffect, useMemo } from "react";
import { getMyReservations, cancelReservation } from "../../api/bookReservation.api.js";

// constants
const PAGE_SIZE = 4;

const STATUS_CONFIG = {
  waiting:   { label: "Waiting",   classes: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  reserved:  { label: "Reserved",  classes: "bg-blue-100 text-blue-700",    dot: "bg-blue-600"   },
  collected: { label: "Collected", classes: "bg-green-100 text-green-700",  dot: "bg-green-600"  },
  expired:   { label: "Expired",   classes: "bg-slate-100 text-slate-500",  dot: "bg-slate-400"  },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-600",      dot: "bg-red-500"    },
  completed: { label: "Completed", classes: "bg-green-100 text-green-700",  dot: "bg-green-600"  },
};

// Filters for tabs
const HISTORY_FILTERS = [
  { value: "completed", label: "Completed", },
  { value: "collected", label: "Collected",  },
  { value: "cancelled", label: "Cancelled",  },
  { value: "expired",   label: "Expired",    },
];

// icons
const BookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// badge
const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// skeleton
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 animate-pulse">
    <div className="w-[52px] h-[68px] rounded-lg bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 w-24 bg-slate-200 rounded-full" />
      <div className="h-5 w-48 bg-slate-200 rounded" />
      <div className="h-3 w-32 bg-slate-200 rounded" />
    </div>
  </div>
);

// empty state
const EmptyState = ({ tab, hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
      <BookIcon className="w-7 h-7" />
    </div>
    <p className="font-semibold text-[#0d1b4b] mb-1">No reservations found</p>
    <p className="text-sm text-slate-400 text-center max-w-xs">
      {hasFilters
        ? "No reservations match the selected filters. Try adjusting or clearing them."
        : tab === "history"
        ? "Your past reservations will appear here once you've borrowed books."
        : "You have no active reservations right now. Browse the library to reserve a book!"}
    </p>
  </div>
);

// cancel modal
const CancelModal = ({ bookName, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="text-center text-[#0d1b4b] font-bold text-lg mb-1">Cancel Reservation?</h3>
      <p className="text-center text-slate-500 text-sm mb-6">
        Are you sure you want to cancel your reservation for{" "}
        <span className="font-semibold text-[#0d1b4b]">{bookName}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

//pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-xs text-slate-400 font-medium">
        Page <span className="text-[#0d1b4b] font-bold">{currentPage}</span> of{" "}
        <span className="text-[#0d1b4b] font-bold">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500
                     hover:bg-blue-50 hover:border-blue-300 hover:text-[#0d1b4b]
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
                ${p === currentPage
                  ? "bg-[#0d1b4b] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-[#0d1b4b]"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500
                     hover:bg-blue-50 hover:border-blue-300 hover:text-[#0d1b4b]
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

// filters (for tabs only)
const FilterPills = ({ activeFilters, onToggle, onClear }) => (
  <div className="flex flex-wrap items-center gap-2 mb-4">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">Filter</span>

    {HISTORY_FILTERS.map(({ value, label, icon }) => {
      const isActive = activeFilters.includes(value);
      return (
        <button
          key={value}
          onClick={() => onToggle(value)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
            ${isActive
              ? "bg-[#0d1b4b] text-white border-[#0d1b4b] shadow-sm"
              : "bg-white text-slate-500 border-slate-200 hover:border-[#0d1b4b] hover:text-[#0d1b4b]"
            }`}
        >
          <span>{icon}</span>
          {label}
          {isActive && <span className="ml-0.5 opacity-60 text-[10px]">✕</span>}
        </button>
      );
    })}

    {activeFilters.length > 0 && (
      <button
        onClick={onClear}
        className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer underline underline-offset-2 ml-1"
      >
        Clear all
      </button>
    )}
  </div>
);

// reservation card
const ReservationCard = ({ resv, onCancelRequest, cancelling, onHide }) => {
  const canCancel = resv.status === "waiting" || resv.status === "reserved";
  const canHide= resv.status=== "cancelled" || resv.status==="expired";

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Book cover */}
      <div className="w-[52px] h-[68px] rounded-lg overflow-hidden shrink-0 bg-blue-50 flex items-center justify-center text-blue-500">
        {resv.bookId?.img ? (
          <img src={resv.bookId.img} alt={resv.bookId.name} className="w-full h-full object-cover" />
        ) : (
          <BookIcon className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Badge status={resv.status} />
            <h3 className="mt-2 mb-0.5 text-[15px] font-bold text-[#0d1b4b] leading-snug">
              {resv.bookId?.name || "Unknown Book"}
            </h3>
            <p className="text-[13px] text-slate-500">By {resv.bookId?.author || "Unknown Author"}</p>
          </div>

          {canCancel && (
            <button
              onClick={() => onCancelRequest(resv._id, resv.bookId?.name)}
              disabled={cancelling === resv._id}
              className="shrink-0 px-4 py-1.5 rounded-lg border border-red-400 text-red-500 text-xs font-semibold
                         bg-transparent hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-150 whitespace-nowrap cursor-pointer"
            >
              {cancelling === resv._id ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Cancelling…
                </span>
              ) : "Cancel"}
            </button>
          )}

          {canHide && (
            <button
              onClick={()=> onHide(resv._id)}
              className= "shrink-0 p-1.5 rounded-lg border border-slate-200 text-slate-400"
              title="Hide Reservation"
            >
              < TrashIcon/>
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
          {resv.createdAt && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <CalendarIcon />
              Reserved on {fmt(resv.createdAt)}
            </span>
          )}
          {resv.expiredDate && (resv.status === "reserved" || resv.status === "waiting") && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <ClockIcon />
              Expires {fmt(resv.expiredDate)}
            </span>
          )}
          {resv.timeRemaining && resv.status === "reserved" && (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              <ClockIcon />
              {resv.timeRemaining}
            </span>
          )}
          {resv.collectedDate && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CalendarIcon />
              Collected {fmt(resv.collectedDate)}
            </span>
          )}
        </div>

        {/* Action required banner */}
        {resv.isActionRequired && (
          <div className="mt-3 px-3.5 py-2 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-xs text-[#1a2d6d] font-medium">
             Please collect your book before the expiry time.
          </div>
        )}
      </div>
    </div>
  );
};

// Main content page
export default function MyReservations() {
  const [tab, setTab]                 = useState("active");
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [cancelling, setCancelling]   = useState(null);
  const [modalTarget, setModalTarget] = useState(null);    // { id, bookName }
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState([]);  // e.g. ["cancelled","expired"]
  const [hiddenIds, setHiddenIds]= useState(()=> {
    const saved = localStorage.getItem("hiddenReservationIds");
    return saved? new Set(JSON.parse(saved)) : new Set();
  });

  // fetch
  const fetchData = async (activeTab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyReservations({ tab: activeTab });
      setData(res.data?.data || []);
    } catch {
      setError("Failed to load your reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
    setActiveFilters([]);  // clear filters when switching tabs
    setCurrentPage(1);
  }, [tab]);

  // derived data
  const visibleData    = data.filter((r)=> !hiddenIds.has(r._id));
  const actionRequired = visibleData.filter((r) => r.isActionRequired);
  const rest           = visibleData.filter((r) => !r.isActionRequired);

  // Apply status filters (only on history tab when filters are active)
  const filteredRest = useMemo(() => {
    if (tab !== "history" || activeFilters.length === 0) return rest;
    return rest.filter((r) => activeFilters.includes(r.status));
  }, [rest, activeFilters, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredRest.length / PAGE_SIZE));
  const pagedRest  = filteredRest.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isFiltered    = tab === "history" && activeFilters.length > 0;
  const displayCount  = isFiltered ? filteredRest.length : data.length;
  const isEmpty       = isFiltered ? filteredRest.length === 0 : data.length === 0;

  // handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFilter = (value) => {
    setActiveFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setCurrentPage(1);
  };

  const handleCancelRequest = (id, bookName) => setModalTarget({ id, bookName });

  const handleCancelConfirm = async () => {
    const { id } = modalTarget;
    setModalTarget(null);
    setCancelling(id);
    try {
      cancelReservation(id);
      setData((prev) => {
        const next = prev.filter((r) => r._id !== id);
        const newTotal = Math.max(1, Math.ceil(
          next.filter((r) => !r.isActionRequired).length / PAGE_SIZE
        ));
        setCurrentPage((p) => Math.min(p, newTotal));
        return next;
      });
    } catch {
      setError("Failed to cancel reservation. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  // for rendering
  return (
    <div className="min-h-screen bg-blue-50">

      {/* Cancel modal */}
      {modalTarget && (
        <CancelModal
          bookName={modalTarget.bookName || "this book"}
          onConfirm={handleCancelConfirm}
          onClose={() => setModalTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-[#0d1b4b] pt-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">
                Library Hub
              </p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                My Reservations
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Track and manage your book reservations.
              </p>
            </div>

            {!loading && (
              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                  {isFiltered ? "Filtered" : tab === "active" ? "Active" : "Historical"}
                </p>
                <p className="text-3xl font-extrabold text-white leading-none">
                  {displayCount}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-7">
            {["active", "history"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-t-xl text-sm font-semibold capitalize transition-all duration-200 border-none cursor-pointer
                  ${tab === t
                    ? "bg-blue-50 text-[#0d1b4b]"
                    : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
              >
                {t === "active" ? "Active" : "History"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-6 py-7 pb-16">

        {/* Skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="flex-1 text-red-700 text-sm font-medium">{error}</p>
            <button
              onClick={() => { setError(null); fetchData(tab); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer shrink-0"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* History filters — only shown when there's data */}
            {tab === "history" && data.length > 0 && (
              <FilterPills
                activeFilters={activeFilters}
                onToggle={toggleFilter}
                onClear={clearFilters}
              />
            )}

            {/* Empty state */}
            {isEmpty && <EmptyState tab={tab} hasFilters={isFiltered} />}

            {/* Cards */}
            {!isEmpty && (
              <div className="flex flex-col gap-3">

                {/* Action required (active tab, always unpaginated) */}
                {actionRequired.length > 0 && tab === "active" && (
                  <>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                      Action Required
                    </p>
                    {actionRequired.map((r) => (
                      <ReservationCard
                        key={r._id}
                        resv={r}
                        onCancelRequest={handleCancelRequest}
                        cancelling={cancelling}
                        onHide={(id)=> setHiddenIds((prev)=> {
                          const next= new Set(prev).add(id);
                          localStorage.setItem("hiddenReservationIds", JSON.stringify([...next]));
                          return next;
                        })}
                      />
                    ))}
                  </>
                )}

                {/* Section divider */}
                {actionRequired.length > 0 && filteredRest.length > 0 && tab === "active" && (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-0.5">
                    Other Reservations
                  </p>
                )}

                {/* Paginated cards */}
                {pagedRest.map((r) => (
                  <ReservationCard
                    key={r._id}
                    resv={r}
                    onCancelRequest={handleCancelRequest}
                    cancelling={cancelling}
                     onHide={(id)=> setHiddenIds((prev)=> {
                          const next= new Set(prev).add(id);
                          localStorage.setItem("hiddenReservationIds", JSON.stringify([...next]));
                          return next;
                        })}
                  />
                ))}

                {/* Pagination controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}