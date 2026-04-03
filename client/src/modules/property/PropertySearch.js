import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProperties } from '../../services/propertyService';
import { createBooking } from '../../services/bookingService';
import SearchBar    from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import PropertyCard  from './components/PropertyCard';
import Pagination    from './components/Pagination';
import { CardSkeleton } from '../../shared/components/Skeleton';
import styles from './search.module.css';

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest first' },
  { value: 'rent_asc',  label: 'Price: Low → High' },
  { value: 'rent_desc', label: 'Price: High → Low' },
];

const DEFAULT_FILTERS = { city: '', type: '', minRent: '', maxRent: '', status: '' };

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Active filter pills ───────────────────────────────────────────────────────
function ActivePills({ filters, search, onRemove, onClearSearch }) {
  const pills = [];
  if (search)           pills.push({ key: '__search', label: `"${search}"`, onRemove: onClearSearch });
  if (filters.city)     pills.push({ key: 'city',    label: filters.city });
  if (filters.type)     pills.push({ key: 'type',    label: filters.type });
  if (filters.status)   pills.push({ key: 'status',  label: filters.status });
  if (filters.minRent)  pills.push({ key: 'minRent', label: `≥ ₹${filters.minRent}` });
  if (filters.maxRent)  pills.push({ key: 'maxRent', label: `≤ ₹${filters.maxRent}` });

  if (!pills.length) return null;

  return (
    <div className={styles.activePills} aria-label="Active filters">
      {pills.map(({ key, label, onRemove: customRemove }) => (
        <span key={key} className={styles.pill}>
          {label}
          <button
            className={styles.pillRemove}
            onClick={() => (customRemove ?? onRemove)(key)}
            aria-label={`Remove filter: ${label}`}
            type="button"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertySearch() {
  const [rooms, setRooms]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [bookSuccess, setBookSuccess] = useState('');

  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [sort, setSort]           = useState('newest');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const resultsRef = useRef(null);

  const totalPages = Math.ceil(total / LIMIT);

  // Count active filters for the mobile badge
  const activeFilterCount = Object.values(filters).filter(Boolean).length
    + (debouncedSearch ? 1 : 0);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        page: targetPage,
        limit: LIMIT,
      };

      // Map search string → city or address (backend supports city filter)
      if (debouncedSearch) params.city = debouncedSearch;

      const res = await getProperties(params);
      let { rooms: data, total: t } = res.data.data;

      // Client-side sort (backend doesn't support sort param yet)
      if (sort === 'rent_asc')  data = [...data].sort((a, b) => (a.rent ?? Infinity) - (b.rent ?? Infinity));
      if (sort === 'rent_desc') data = [...data].sort((a, b) => (b.rent ?? -1) - (a.rent ?? -1));

      setRooms(data);
      setTotal(t);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, sort]);

  // Re-fetch when filters / search / sort change — reset to page 1
  useEffect(() => {
    fetchRooms(1);
  }, [filters, debouncedSearch, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleFilterRemove = (key) => {
    setFilters((f) => ({ ...f, [key]: '' }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
  };

  const handlePage = (p) => {
    fetchRooms(p);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBook = async (roomId) => {
    setBookingId(roomId);
    setBookSuccess('');
    try {
      await createBooking(roomId);
      setBookSuccess('Booking request sent! The landlord will review it shortly.');
      // Optimistically mark as occupied in local state
      setRooms((prev) =>
        prev.map((r) => r._id === roomId ? { ...r, status: 'occupied' } : r)
      );
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBookingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Hero + search bar */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Find Your Perfect Room</h1>
        <p className={styles.heroSub}>
          {total > 0 ? `${total} properties available` : 'Browse verified listings across the city'}
        </p>
        <SearchBar value={search} onChange={setSearch} autoFocus />
      </div>

      <div className={styles.body}>
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          isOpen={sidebarOpen}
        />

        {/* Results */}
        <section className={styles.results} ref={resultsRef}>
          {/* Mobile filter toggle */}
          <button
            className={styles.filterToggle}
            onClick={() => setSidebarOpen((o) => !o)}
            type="button"
            aria-expanded={sidebarOpen}
          >
            🎛 Filters
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>

          {/* Active filter pills */}
          <ActivePills
            filters={filters}
            search={debouncedSearch}
            onRemove={handleFilterRemove}
            onClearSearch={() => setSearch('')}
          />

          {/* Results header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {loading ? 'Loading…' : (
                <><strong>{total}</strong> {total === 1 ? 'property' : 'properties'} found</>
              )}
            </p>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <span>⚠</span>
              <span>{error}</span>
              <button
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600 }}
                onClick={() => { setError(''); fetchRooms(page); }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Booking success */}
          {bookSuccess && (
            <div
              style={{ padding: '12px 16px', background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, color: 'var(--success)', fontSize: 14, marginBottom: 16 }}
              role="status"
            >
              ✓ {bookSuccess}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: LIMIT }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : rooms.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🏚️</div>
              <p className={styles.emptyTitle}>No properties found</p>
              <p className={styles.emptyText}>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {rooms.map((room) => (
                <PropertyCard
                  key={room._id}
                  room={room}
                  booking={bookingId === room._id}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
        </section>
      </div>
    </div>
  );
}
