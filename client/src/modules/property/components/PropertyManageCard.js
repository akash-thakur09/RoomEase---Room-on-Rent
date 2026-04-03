import React from 'react';
import styles from '../properties.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

/**
 * PropertyManageCard — landlord's property card with edit + delete.
 *
 * @param {Object}   room
 * @param {Function} onEdit    - (room) => void
 * @param {Function} onDelete  - (roomId) => void
 */
export default function PropertyManageCard({ room, onEdit, onDelete }) {
  const photo = room.photos?.[0];
  const isAvailable = room.status === 'available';

  return (
    <article className={styles.card} aria-label={`${room.type} at ${room.address}`}>
      {/* Image */}
      <div className={styles.cardImage}>
        {photo
          ? <img src={`/uploads/${photo.split('/').pop().split('\\').pop()}`} alt={room.type} loading="lazy" />
          : <div className={styles.cardImagePlaceholder}>{TYPE_ICONS[room.type] ?? '🏠'}</div>
        }
        <span className={styles.cardTypeBadge}>{room.type}</span>
        <span className={`${styles.cardStatusBadge} ${isAvailable ? styles.statusAvailable : styles.statusOccupied}`}>
          {room.status}
        </span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <p className={styles.cardAddress} title={room.address}>{room.address}</p>
        <p className={styles.cardCity}>📍 {room.city}</p>

        {room.rent != null
          ? <p className={styles.cardRent}>₹{room.rent.toLocaleString('en-IN')}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></p>
          : <p className={styles.cardRentNull}>No rent set</p>
        }

        {room.description && (
          <p className={styles.cardDesc}>{room.description}</p>
        )}

        {room.amenities?.length > 0 && (
          <div className={styles.cardAmenities}>
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className={styles.amenityTag}>{a}</span>
            ))}
            {room.amenities.length > 4 && (
              <span className={styles.amenityTag}>+{room.amenities.length - 4}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.cardFooter}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(room)}
            aria-label={`Edit ${room.address}`}
          >
            ✏ Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(room._id)}
            aria-label={`Delete ${room.address}`}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </article>
  );
}
