import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { getLandlordStats } from '../../services/landlordService';
import { addRoom } from '../../services/propertyService';
import Modal from '../../shared/components/Modal/Modal';
import StatCard       from './components/StatCard';
import RecentBookings from './components/RecentBookings';
import PropertyList   from './components/PropertyList';
import EarningsChart  from './components/EarningsChart';
import styles from './dashboard.module.css';

// ── Add Property Modal ────────────────────────────────────────────────────────
function AddPropertyModal({ userId, onClose, onAdded }) {
  const [form, setForm]     = useState({ type: 'single', address: '', city: '', rent: '', status: 'available' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const email = localStorage.getItem('userEmail');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append('email', email);
      fd.append('landlord', userId);
      photos.forEach((p) => fd.append('photos', p));
      await addRoom(userId, fd);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add property.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 8, fontFamily: 'inherit', fontSize: 14,
    background: 'var(--bg)', color: 'var(--text)', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    color: 'var(--text-muted)', marginBottom: 6,
  };

  const fields = [
    { name: 'address', label: 'Address',     type: 'text',   placeholder: 'Street address' },
    { name: 'city',    label: 'City',         type: 'text',   placeholder: 'City' },
    { name: 'rent',    label: 'Rent (₹/mo)',  type: 'number', placeholder: 'e.g. 8000' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Type */}
        <div>
          <label style={labelStyle}>Room Type</label>
          <select name="type" value={form.type} onChange={onChange} style={fieldStyle}>
            <option value="single">Single Room</option>
            <option value="sharing">Shared Room</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        {fields.map(({ name, label, type, placeholder }) => (
          <div key={name}>
            <label style={labelStyle}>{label}</label>
            <input
              name={name} type={type} placeholder={placeholder}
              value={form[name]} onChange={onChange}
              required={name !== 'rent'}
              style={fieldStyle}
            />
          </div>
        ))}

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select name="status" value={form.status} onChange={onChange} style={fieldStyle}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        {/* Photos */}
        <div>
          <label style={labelStyle}>Photos (optional)</label>
          <input
            type="file" multiple accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhotos(Array.from(e.target.files))}
            style={{ fontSize: 13, color: 'var(--text-muted)' }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, color: 'var(--danger)', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Adding…' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`skeleton ${styles.skeletonStat}`} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className={`skeleton ${styles.skeletonSection}`} />
        <div className={`skeleton ${styles.skeletonSection}`} />
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandlordDashboardPage() {
  const { user } = useAuth();

  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showModal,  setShowModal]  = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLandlordStats();
      setStats(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Optimistic booking status update
  const handleBookingStatusChange = (bookingId, newStatus) => {
    setStats((prev) => {
      if (!prev) return prev;
      const updatedRecent = prev.bookings.recent.map((b) =>
        b._id === bookingId ? { ...b, status: newStatus } : b
      );
      const pendingDelta = newStatus !== 'pending' ? -1 : 0;
      return {
        ...prev,
        bookings: {
          ...prev.bookings,
          recent:  updatedRecent,
          pending: Math.max(0, prev.bookings.pending + pendingDelta),
        },
      };
    });
  };

  const formatRupees = (paise) => {
    const r = paise / 100;
    if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`;
    if (r >= 1000)   return `₹${(r / 1000).toFixed(1)}K`;
    return `₹${r.toFixed(0)}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Welcome header */}
        <div className={styles.welcome}>
          <div className={styles.welcomeText}>
            <h1 className={styles.welcomeTitle}>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className={styles.welcomeSub}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            + Add Property
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '14px 18px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10, color: 'var(--danger)', fontSize: 14, marginBottom: 20 }} role="alert">
            ⚠ {error}
            <button onClick={fetchStats} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>Retry</button>
          </div>
        )}

        {loading ? <PageSkeleton /> : stats && (
          <>
            {/* Stat cards */}
            <div className={styles.statsGrid}>
              <StatCard
                variant="properties"
                label="Total Properties"
                value={stats.properties.total}
                sub={`${stats.properties.available} available · ${stats.properties.occupied} occupied`}
              />
              <StatCard
                variant="occupied"
                label="Occupied"
                value={stats.properties.occupied}
                sub={`${stats.properties.total > 0 ? Math.round((stats.properties.occupied / stats.properties.total) * 100) : 0}% occupancy rate`}
              />
              <StatCard
                variant="pending"
                label="Pending Requests"
                value={stats.bookings.pending}
                sub={`${stats.bookings.total} total bookings`}
              />
              <StatCard
                variant="earnings"
                label="Total Earnings"
                value={formatRupees(stats.earnings.total)}
                sub={`${stats.earnings.paid} paid booking${stats.earnings.paid !== 1 ? 's' : ''}`}
              />
            </div>

            {/* Two-column body */}
            <div className={styles.body}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <RecentBookings
                  bookings={stats.bookings.recent}
                  onStatusChange={handleBookingStatusChange}
                />
                <EarningsChart
                  monthly={stats.earnings.monthly}
                  total={stats.earnings.total}
                  paid={stats.earnings.paid}
                />
              </div>

              {/* Right column */}
              <PropertyList
                properties={stats.properties.recent}
                onAdd={() => setShowModal(true)}
              />
            </div>
          </>
        )}
      </div>

      {/* Add property modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Property"
          size="md"
        >
          <AddPropertyModal
            userId={user?.userId}
            onClose={() => setShowModal(false)}
            onAdded={() => { setShowModal(false); fetchStats(); }}
          />
        </Modal>
      )}
    </div>
  );
}
