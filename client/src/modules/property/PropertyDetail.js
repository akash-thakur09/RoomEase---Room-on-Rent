import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyById } from '../../services/propertyService';
import { getPropertyReviews } from '../../services/reviewService';
import { getBookings } from '../../services/bookingService';
import { useAuth } from '../../shared/hooks/useAuth';
import ImageGallery  from './components/ImageGallery';
import PropertyInfo  from './components/PropertyInfo';
import BookingButton from './components/BookingButton';
import ReviewList    from '../review/ReviewList';
import styles from './detail.module.css';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  const line = (w, h = 16, mb = 10) => (
    <div className={`skeleton ${styles.skeletonLine}`} style={{ width: w, height: h, marginBottom: mb }} />
  );
  return (
    <div className={styles.container}>
      <div className={`skeleton ${styles.skeletonGallery}`} />
      <div className={styles.layout} style={{ marginTop: 24 }}>
        <div>
          {line('60%', 28, 14)}
          {line('40%', 18, 20)}
          {line('100%', 14)}
          {line('90%',  14)}
          {line('75%',  14)}
        </div>
        <div>
          <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

// ── Landlord card ─────────────────────────────────────────────────────────────
function LandlordCard({ landlord }) {
  if (!landlord) return null;
  return (
    <div className={styles.landlordCard}>
      <p className={styles.landlordCardTitle}>Listed by</p>
      <div className={styles.landlordProfile}>
        <div className={styles.landlordAvatar}>
          {landlord.profilePhoto
            ? <img src={landlord.profilePhoto} alt={landlord.name} />
            : landlord.name?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <p className={styles.landlordName}>{landlord.name}</p>
          <p className={styles.landlordEmail}>{landlord.email}</p>
          {landlord.isVerified && (
            <span className={styles.landlordVerified}>✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertyDetail() {
  const { id } = useParams();
  const { isTenant } = useAuth();

  const [property,  setProperty]  = useState(null);
  const [reviews,   setReviews]   = useState({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [, setBooked]    = useState(false);

  // Completed bookings for this property (for review form)
  const [completedBookings, setCompletedBookings] = useState([]);

  // ── Fetch property + reviews + bookings in parallel ──────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    const promises = [
      getPropertyById(id),
      getPropertyReviews(id),
    ];

    // If tenant, also fetch their completed bookings for this property
    if (isTenant) {
      promises.push(getBookings({ limit: 100 }));
    }

    Promise.all(promises)
      .then(([propRes, revRes, bookingsRes]) => {
        setProperty(propRes.data.data);
        setReviews(revRes.data.data);

        if (bookingsRes) {
          const completed = (bookingsRes.data.data.bookings ?? []).filter(
            (b) => b.status === 'completed' && String(b.propertyId?._id) === String(id)
          );
          setCompletedBookings(completed);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load property.'))
      .finally(() => setLoading(false));
  }, [id, isTenant]);

  const handleBooked = () => {
    setBooked(true);
    setProperty((p) => p ? { ...p, status: 'occupied' } : p);
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after submit
    getPropertyReviews(id)
      .then((res) => setReviews(res.data.data))
      .catch(() => {});
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return <div className={styles.page}><DetailSkeleton /></div>;

  if (error || !property) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <div className={styles.notFoundIcon}>🏚️</div>
            <p className={styles.notFoundTitle}>Property not found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {error || 'This listing may have been removed.'}
            </p>
            <Link to="/search" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              ← Back to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const landlord = property.landlord;
  const canReview = isTenant && completedBookings.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back */}
        <Link to="/search" className={styles.back}>← Back to search</Link>

        {/* Gallery — full width */}
        <ImageGallery photos={property.photos} type={property.type} />

        {/* Two-column layout */}
        <div className={styles.layout}>
          {/* Left: info + reviews */}
          <div>
            <PropertyInfo property={property} />

            <ReviewList
              averageRating={reviews.averageRating}
              totalReviews={reviews.totalReviews}
              reviews={reviews.reviews}
              canReview={canReview}
              completedBookings={completedBookings}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>

          {/* Right: sticky sidebar */}
          <div className={styles.sidebar}>
            <BookingButton
              property={property}
              onBooked={handleBooked}
            />
            <LandlordCard landlord={landlord} />
          </div>
        </div>
      </div>
    </div>
  );
}
