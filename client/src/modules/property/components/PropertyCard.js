import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../search.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

/**
 * PropertyCard
 *
 * @param {Object}   room        - property data object
 * @param {boolean}  booking     - true while this card's booking is in-flight
 * @param {Function} onBook      - (roomId) => void
 */
export default function PropertyCard({ room, booking = false, onBook }) {
  const isOccupied = room.status === 'occupied';
  const photo      = room.photos?.[0];

  return (
    <article className={styles.card} aria-label={`${room.type} at ${room.address}`}>
      {/* Image — links to detail page */}
      <Link to={`/property/${room._id}`} className={styles.cardImage} tabIndex={-1} aria-hidden="true">
        {photo ? (
          <img src={`/uploads/${photo}`} alt={`${room.type} in ${room.city}`} loading="lazy" />
        ) : (
          <div className={styles.cardImagePlaceholder} aria-hidden="true">
            {TYPE_ICONS[room.type] ?? '🏠'}
          </div>
        )}
        <span className={styles.cardTypeBadge}>{room.type}</span>
        <span className={[styles.cardStatusBadge, styles[room.status]].join(' ')}>
          {room.status}
        </span>
      </Link>

      {/* Body */}
      <div className={styles.cardBody}>
        <Link to={`/property/${room._id}`} style={{ textDecoration: 'none' }}>
          <p className={styles.cardAddress} title={room.address}>{room.address}</p>
        </Link>
        <p className={styles.cardCity}>📍 {room.city}</p>

        <div className={styles.cardMeta}>
          {room.rent != null ? (
            <span className={styles.cardRent}>₹{room.rent.toLocaleString('en-IN')}<small>/mo</small></span>
          ) : (
            <span className={styles.cardRentNull}>Price on request</span>
          )}

          <button
            className={[styles.bookBtn, isOccupied ? styles.bookBtnOccupied : ''].join(' ')}
            onClick={() => !isOccupied && onBook(room._id)}
            disabled={isOccupied || booking}
            aria-label={isOccupied ? 'Property occupied' : `Book ${room.address}`}
          >
            {booking ? '…' : isOccupied ? 'Occupied' : 'Book Now'}
          </button>
        </div>
      </div>
    </article>
  );
}
