import React from 'react';
import styles from '../detail.module.css';

const TYPE_LABELS = { single: 'Single Room', sharing: 'Shared Room', apartment: 'Apartment' };

/**
 * PropertyInfo
 * @param {Object} property - full room document (populated landlord)
 */
export default function PropertyInfo({ property }) {
  const isAvailable = property.status === 'available';

  return (
    <div className={styles.info}>
      {/* Title + rent */}
      <div className={styles.infoHeader}>
        <h1 className={styles.infoTitle}>{property.address}</h1>
        {property.rent != null && (
          <div>
            <div className={styles.infoRent}>
              ₹{property.rent.toLocaleString('en-IN')}
            </div>
            <div className={styles.infoRentSub}>per month</div>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className={styles.infoBadges}>
        <span className={`${styles.badge} ${styles.badgeType}`}>
          {TYPE_LABELS[property.type] ?? property.type}
        </span>
        <span className={`${styles.badge} ${isAvailable ? styles.badgeAvail : styles.badgeOccupied}`}>
          {isAvailable ? '✓ Available' : '✗ Occupied'}
        </span>
      </div>

      {/* Meta rows */}
      <div className={styles.infoMeta}>
        <div className={styles.infoMetaRow}>
          <span>📍</span>
          <span><strong>{property.city?.charAt(0).toUpperCase() + property.city?.slice(1)}</strong></span>
        </div>
        {property.rent != null && (
          <div className={styles.infoMetaRow}>
            <span>💰</span>
            <span>₹{property.rent.toLocaleString('en-IN')} / month</span>
          </div>
        )}
        <div className={styles.infoMetaRow}>
          <span>🏠</span>
          <span>{TYPE_LABELS[property.type] ?? property.type}</span>
        </div>
        <div className={styles.infoMetaRow}>
          <span>📅</span>
          <span>Listed {new Date(property.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <>
          <div className={styles.divider} />
          <p className={styles.infoDesc}>{property.description}</p>
        </>
      )}

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.amenities}>
            {property.amenities.map((a) => (
              <span key={a} className={styles.amenityTag}>{a}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
