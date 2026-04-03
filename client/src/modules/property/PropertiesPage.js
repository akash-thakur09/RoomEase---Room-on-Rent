import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { getUserRooms, addRoom, updateRoom, deleteRoom } from '../../services/propertyService';
import Modal from '../../shared/components/Modal/Modal';
import PropertyManageCard from './components/PropertyManageCard';
import PropertyForm       from './components/PropertyForm';
import DeleteConfirm      from './components/DeleteConfirm';
import styles from './properties.module.css';

const FILTERS = ['all', 'available', 'occupied'];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className="skeleton" style={{ height: 180 }} />
          <div style={{ padding: 16 }}>
            <div className="skeleton" style={{ height: 16, width: '65%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 13, width: '45%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 18, width: '35%', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
              <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');

  // Modal state
  const [modalMode,    setModalMode]    = useState(null);  // 'add' | 'edit'
  const [editTarget,   setEditTarget]   = useState(null);  // room being edited
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);  // { _id, address }
  const [deleting,     setDeleting]     = useState(false);

  // Open add modal if navigated to /landlord/add-property
  useEffect(() => {
    if (location.pathname === '/landlord/add-property') {
      setModalMode('add');
    }
  }, [location.pathname]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUserRooms(user.userId);
      setRooms(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const displayed = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);

  const counts = {
    all:       rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied:  rooms.filter((r) => r.status === 'occupied').length,
  };

  // ── Add ───────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setSubmitError('');
    setModalMode('add');
    navigate('/landlord/add-property', { replace: true });
  };

  const handleAdd = async (formData) => {
    formData.append('landlord', user.userId);
    setSubmitting(true);
    setSubmitError('');
    try {
      await addRoom(user.userId, formData);
      await fetchRooms();
      closeModal();
    } catch (err) {
      setSubmitError(err.message || 'Failed to add property.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (room) => {
    setEditTarget(room);
    setSubmitError('');
    setModalMode('edit');
  };

  const handleEdit = async (formData) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await updateRoom(editTarget._id, formData);
      await fetchRooms();
      closeModal();
    } catch (err) {
      setSubmitError(err.message || 'Failed to update property.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    setDeleteTarget(room ?? { _id: roomId, address: 'this property' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoom(deleteTarget._id);
      setRooms((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete property.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Close modal ───────────────────────────────────────────────────────────
  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setSubmitError('');
    if (location.pathname === '/landlord/add-property') {
      navigate('/landlord/properties', { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Properties</h1>
            <p className={styles.subtitle}>
              {loading ? 'Loading…' : `${rooms.length} listing${rooms.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className={styles.addBtn} onClick={openAdd}>
            + Add Property
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBox} role="alert">
            <span>⚠ {error}</span>
            <button className={styles.retryBtn} onClick={fetchRooms}>Retry</button>
          </div>
        )}

        {/* Filter chips */}
        {!loading && rooms.length > 0 && (
          <div className={styles.filterBar} role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={[styles.filterChip, filter === f ? styles.filterChipActive : ''].join(' ')}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && ` (${counts[f]})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonGrid />
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🏠</div>
            <p className={styles.emptyTitle}>
              {filter === 'all' ? 'No properties yet' : `No ${filter} properties`}
            </p>
            <p className={styles.emptyText}>
              {filter === 'all'
                ? 'Add your first property to start receiving booking requests.'
                : `You don't have any ${filter} properties right now.`}
            </p>
            {filter === 'all' && (
              <button className={styles.addBtn} onClick={openAdd}>+ Add Property</button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {displayed.map((room) => (
              <PropertyManageCard
                key={room._id}
                room={room}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit Property' : 'Add New Property'}
        size="lg"
      >
        <PropertyForm
          key={editTarget?._id ?? 'add'}
          initial={editTarget ?? {}}
          existingPhotos={editTarget?.photos ?? []}
          submitting={submitting}
          submitError={submitError}
          onSubmit={modalMode === 'edit' ? handleEdit : handleAdd}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirmation */}
      <DeleteConfirm
        isOpen={!!deleteTarget}
        loading={deleting}
        propertyName={deleteTarget?.address ?? ''}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
