import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../shared/components/Navbar/Navbar';
import { ProfileSkeleton } from '../../shared/components/Skeleton';
import { getUserProfile, updateUserProfile, deleteUserAccount, uploadProfilePhoto } from '../../services/userService';
import { getUserRooms } from '../../services/propertyService';
import { getBookings } from '../../services/bookingService';
import { getUserReviews } from '../../services/reviewService';
import { useAuth } from '../../shared/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../booking/components/StatusBadge';
import './profile.css';
import '../auth/auth.css';
import styles from './profileDash.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ userData, user, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (userData) {
      setForm({ name: userData.name, email: userData.email, contactNumber: userData.contactNumber || '' });
    }
  }, [userData]);

  useEffect(() => {
    getUserReviews(user.userId)
      .then((res) => {
        const d = res.data.data;
        setReviews(d?.reviews ?? []);
        setReviewMeta({ averageRating: d?.averageRating ?? 0, totalReviews: d?.totalReviews ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [user.userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile(user.userId, form);
      onUpdate(res.data.data);
      setEditing(false);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      {error && <p className="auth-error">{error}</p>}

      <div className="card profile-section-card">
        <div className="profile-section-header">
          <h3>Personal Details</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {userData?.isVerified
              ? <span className="badge badge-success">✓ Verified</span>
              : <span className="badge badge-warning">Unverified</span>
            }
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="profile-form">
            {[
              { name: 'name',          label: 'Full Name',      type: 'text' },
              { name: 'email',         label: 'Email',          type: 'email' },
              { name: 'contactNumber', label: 'Contact Number', type: 'text' },
            ].map(({ name, label, type }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input type={type} value={form[name] ?? ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <dl className="profile-dl">
            {[
              ['Name',    userData?.name],
              ['Email',   userData?.email],
              ['Contact', userData?.contactNumber || '—'],
            ].map(([label, value]) => (
              <div key={label} className="profile-dl__row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Ratings summary */}
      {reviewMeta.totalReviews > 0 && (
        <div className={styles.ratingBanner}>
          <span className={styles.ratingScore}>{reviewMeta.averageRating.toFixed(1)}</span>
          <Stars rating={Math.round(reviewMeta.averageRating)} />
          <span className={styles.ratingCount}>({reviewMeta.totalReviews} review{reviewMeta.totalReviews !== 1 ? 's' : ''})</span>
        </div>
      )}

      {/* Reviews */}
      <div className="card profile-section-card">
        <div className="profile-section-header">
          <h3>Reviews from Tenants</h3>
          <span className="badge badge-info">{reviews.length}</span>
        </div>
        {loadingReviews ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No reviews yet.</p>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((r) => (
              <div key={r._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>{r.reviewerId?.name ?? 'Anonymous'}</span>
                  <Stars rating={r.rating} />
                </div>
                {r.propertyId && (
                  <p className={styles.reviewProp}>
                    {TYPE_ICONS[r.propertyId.type] ?? '🏠'} {r.propertyId.type} · {r.propertyId.city}
                  </p>
                )}
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                <span className={styles.reviewDate}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onDelete}>
        Delete Account
      </button>
    </div>
  );
}

// ── Your Properties tab ───────────────────────────────────────────────────────
function PropertiesTab({ userId }) {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getUserRooms(userId)
      .then((res) => setRooms(res.data.data ?? []))
      .catch(() => setError('Failed to load properties.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className={styles.tabContent}><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>;
  if (error)   return <div className={styles.tabContent}><p className="auth-error">{error}</p></div>;

  return (
    <div className={styles.tabContent}>
      <div className="card profile-section-card">
        <div className="profile-section-header">
          <h3>Your Properties</h3>
          <span className="badge badge-info">{rooms.length}</span>
        </div>
        {rooms.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No properties added yet.</p>
        ) : (
          <div className={styles.bookingList}>
            {rooms.map((r) => (
              <div key={r._id} className={styles.bookingItem}>
                <div className={styles.bookingThumb}>
                  {r.photos?.[0]
                    ? <img src={`/uploads/${r.photos[0]}`} alt={r.type} />
                    : <span>{TYPE_ICONS[r.type] ?? '🏠'}</span>
                  }
                </div>
                <div className={styles.bookingInfo}>
                  <p className={styles.bookingType}>{r.type}</p>
                  <p className={styles.bookingAddr}>{r.address}, {r.city}</p>
                  {r.rent && <p className={styles.bookingRent}>₹{r.rent.toLocaleString('en-IN')}/mo</p>}
                </div>
                <div className={styles.bookingStatus}>
                  <span className={`badge ${r.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Room Requests tab ─────────────────────────────────────────────────────────
function RoomRequestsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getBookings({ page: 1, limit: 50 })
      .then((res) => setBookings(res.data.data?.bookings ?? []))
      .catch(() => setError('Failed to load requests.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.tabContent}><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>;
  if (error)   return <div className={styles.tabContent}><p className="auth-error">{error}</p></div>;

  return (
    <div className={styles.tabContent}>
      <div className="card profile-section-card">
        <div className="profile-section-header">
          <h3>Room Requests</h3>
          <span className="badge badge-info">{bookings.length}</span>
        </div>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No booking requests yet.</p>
        ) : (
          <div className={styles.bookingList}>
            {bookings.map((b) => {
              const t = b.tenantId;
              const p = b.propertyId;
              return (
                <div key={b._id} className={styles.bookingItem}>
                  <div className={styles.tenantAvatar}>
                    {t?.name?.[0]?.toUpperCase() ?? 'T'}
                  </div>
                  <div className={styles.bookingInfo}>
                    <p className={styles.bookingType}>{t?.name ?? 'Unknown tenant'}</p>
                    <p className={styles.bookingAddr}>{t?.email}</p>
                    <p className={styles.bookingLandlord}>
                      {TYPE_ICONS[p?.type] ?? '🏠'} {p?.type} · {p?.city}
                    </p>
                  </div>
                  <div className={styles.bookingStatus}>
                    <StatusBadge status={b.status} />
                    <span className={styles.bookingDate}>
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile',    label: '👤 Profile' },
  { key: 'properties', label: '🏢 Your Properties' },
  { key: 'requests',   label: '📋 Room Requests' },
];

export default function LandlordProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,  setUserData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    getUserProfile(user.userId)
      .then((res) => setUserData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.userId]);

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profilePhoto', file);
    try {
      const res = await uploadProfilePhoto(user.userId, fd);
      setUserData((prev) => ({ ...prev, profilePhoto: res.data.data?.filePath }));
    } catch { /* silent */ }
  }, [user.userId]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try {
      await deleteUserAccount(user.email);
      logout();
      navigate('/');
    } catch { /* silent */ }
  }, [user, logout, navigate]);

  if (loading) return <div><Navbar /><div className="page-container"><ProfileSkeleton /></div></div>;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className={styles.dashLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarAvatar}>
              {userData?.profilePhoto
                ? <img src={userData.profilePhoto} alt="Profile" className={styles.avatarImg} />
                : <div className={styles.avatarPlaceholder}>{userData?.name?.[0]?.toUpperCase()}</div>
              }
              <label className={styles.photoBtn}>
                📷
                <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
              </label>
            </div>
            <p className={styles.sidebarName}>{userData?.name}</p>
            <span className="badge badge-success" style={{ fontSize: 11 }}>Landlord</span>

            <nav className={styles.sidebarNav}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={[styles.navItem, activeTab === t.key ? styles.navItemActive : ''].join(' ')}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className={styles.main}>
            {activeTab === 'profile'    && (
              <ProfileTab userData={userData} user={user} onUpdate={setUserData} onDelete={handleDelete} />
            )}
            {activeTab === 'properties' && <PropertiesTab userId={user.userId} />}
            {activeTab === 'requests'   && <RoomRequestsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
