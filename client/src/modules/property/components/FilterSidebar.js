import React from 'react';
import styles from '../search.module.css';

const CITIES = ['Indore', 'Bhopal', 'Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad'];

const TYPES = [
  { value: 'single',    label: 'Single Room',  icon: '🛏️' },
  { value: 'sharing',   label: 'Shared Room',  icon: '🏠' },
  { value: 'apartment', label: 'Apartment',    icon: '🏢' },
];

const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'occupied',  label: 'Occupied'  },
];

/**
 * FilterSidebar
 *
 * @param {Object}   filters   - { city, type, minRent, maxRent, status }
 * @param {Function} onChange  - (key, value) => void
 * @param {Function} onReset   - clears all filters
 * @param {boolean}  isOpen    - mobile drawer open state
 */
export default function FilterSidebar({ filters, onChange, onReset, isOpen }) {
  console.log('Fetch details:-  FilterSidebar render with filters:', filters);
  const activeCount = [
    filters.city, filters.type, filters.minRent, filters.maxRent, filters.status,
  ].filter(Boolean).length;

  return (
    <aside
      className={[styles.sidebar, isOpen ? styles.sidebarOpen : ''].join(' ')}
      aria-label="Filter properties"
    >
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Filters {activeCount > 0 && `(${activeCount})`}</span>
        {activeCount > 0 && (
          <button className={styles.resetBtn} onClick={onReset} type="button">
            Reset all
          </button>
        )}
      </div>

      {/* City */}
      <div className={styles.filterSection}>
        <label htmlFor="filter-city" className={styles.filterLabel}>City</label>
        <select
          id="filter-city"
          className={styles.filterSelect}
          value={filters.city}
          onChange={(e) => onChange('city', e.target.value)}
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Property type */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Property Type</span>
        <div className={styles.typeChips} role="group" aria-label="Property type">
          {TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              className={[
                styles.typeChip,
                filters.type === value ? styles.typeChipActive : '',
              ].join(' ')}
              onClick={() => onChange('type', filters.type === value ? '' : value)}
              aria-pressed={filters.type === value}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Price Range (₹/mo)</span>
        <div className={styles.priceInputs}>
          <div>
            <span className={styles.priceLabel}>Min</span>
            <input
              type="number"
              className={styles.priceInput}
              placeholder="0"
              min={0}
              value={filters.minRent}
              onChange={(e) => onChange('minRent', e.target.value)}
              aria-label="Minimum rent"
            />
          </div>
          <div>
            <span className={styles.priceLabel}>Max</span>
            <input
              type="number"
              className={styles.priceInput}
              placeholder="Any"
              min={0}
              value={filters.maxRent}
              onChange={(e) => onChange('maxRent', e.target.value)}
              aria-label="Maximum rent"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Availability</span>
        <div className={styles.statusChips} role="group" aria-label="Availability">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={[
                styles.statusChip,
                filters.status === value ? `${styles.statusChipActive} ${styles[value]}` : '',
              ].join(' ')}
              onClick={() => onChange('status', filters.status === value ? '' : value)}
              aria-pressed={filters.status === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
