import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../dashboard.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

/**
 * PropertyList — compact list of the landlord's recent properties.
 * @param {Array}    properties
 * @param {Function} onAdd   - opens add-property modal
 */
export default function PropertyList({ properties = [], onAdd }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>My Properties</span>
        <Link to="/landlord/properties" className={styles.sectionLink}>Manage →</Link>
      </div>

      <div className={styles.propList}>
        {properties.length === 0 ? (
          <div className={styles.emptyRow}>
            No properties yet.{' '}
            <button
              onClick={onAdd}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              Add one →
            </button>
          </div>
        ) : (
          properties.map((p) => {
            const photo = p.photos?.[0];
            return (
              <div key={p._id} className={styles.propRow}>
                {/* Thumbnail */}
                <div className={styles.propThumb}>
                  {photo
                    ? <img src={`/uploads/${photo}`} alt={p.type} />
                    : <span aria-hidden="true">{TYPE_ICONS[p.type] ?? '🏠'}</span>
                  }
                </div>

                {/* Info */}
                <div className={styles.propInfo}>
                  <p className={styles.propType}>{p.type}</p>
                  <p className={styles.propAddress}>{p.address}</p>
                  <p className={styles.propCity}>📍 {p.city}</p>
                </div>

                {/* Rent + status */}
                <div className={styles.propRight}>
                  {p.rent != null
                    ? <span className={styles.propRent}>₹{p.rent.toLocaleString('en-IN')}/mo</span>
                    : <span className={styles.propRentNull}>No rent set</span>
                  }
                  <span className={`${styles.badge} ${p.status === 'available' ? styles.badgeApproved : styles.badgeRejected}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
