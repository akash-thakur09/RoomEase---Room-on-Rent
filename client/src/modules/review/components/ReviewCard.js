import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import styles from '../review.module.css';

/**
 * ReviewCard — single review display.
 *
 * @param {Object}  review
 * @param {boolean} showProperty - show property tag (for "my reviews" list)
 */
export default function ReviewCard({ review, showProperty = false }) {
  const reviewer = review.reviewerId;
  const property = review.propertyId;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        {/* Reviewer */}
        <div className={styles.reviewer}>
          <div className={styles.avatar}>
            {reviewer?.profilePhoto
              ? <img src={reviewer.profilePhoto} alt={reviewer.name} />
              : (reviewer?.name?.[0]?.toUpperCase() ?? 'U')
            }
          </div>
          <div>
            <p className={styles.reviewerName}>{reviewer?.name ?? 'Anonymous'}</p>
            <p className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stars + optional property tag */}
        <div className={styles.cardRight}>
          <StarRating rating={review.rating} size="sm" />
          {showProperty && property && (
            <Link
              to={`/property/${property._id}`}
              className={styles.propertyTag}
            >
              {property.type} · {property.city}
            </Link>
          )}
        </div>
      </div>

      {review.comment
        ? <p className={styles.comment}>{review.comment}</p>
        : <p className={styles.noComment}>No written review.</p>
      }
    </article>
  );
}
