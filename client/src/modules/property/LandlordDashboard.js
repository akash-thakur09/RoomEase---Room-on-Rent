import React, { useState, useEffect } from 'react';
import Navbar from '../../shared/components/Navbar/Navbar';
import { CardSkeleton } from '../../shared/components/Skeleton';
import { getUserRooms, addRoom, deleteRoom } from '../../services/propertyService';
import { useAuth } from '../../shared/hooks/useAuth';
import './property.css';
import '../auth/auth.css';

function AddRoomModal({ userId, onClose, onAdded }) {
  const [form, setForm] = useState({ type: 'single', address: '', city: '', status: 'available' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const email = localStorage.getItem('userEmail');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('email', email);
      fd.append('landlord', userId);
      photos.forEach((p) => fd.append('photos', p));
      await addRoom(userId, fd);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Property</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Type</label>
            <select name="type" value={form.type} onChange={onChange}>
              <option value="single">Single</option>
              <option value="sharing">Sharing</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" placeholder="Street address" value={form.address} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input name="city" placeholder="City" value={form.city} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
          <div className="form-group">
            <label>Photos</label>
            <input type="file" multiple accept="image/png,image/jpeg"
              onChange={(e) => setPhotos(Array.from(e.target.files))} />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding…' : 'Add Property'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await getUserRooms(user.userId);
      setRooms(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []); // eslint-disable-line

  const handleDelete = async (roomId) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    } catch {
      alert('Failed to delete property.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="dashboard-header">
          <div>
            <h1>My Properties</h1>
            <p className="text-muted">{rooms.length} listing{rooms.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Property</button>
        </div>

        {error && <div className="error-state"><p>{error}</p></div>}

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <h3>No properties yet</h3>
            <p>Add your first property to get started</p>
          </div>
        ) : (
          <div className="grid-3">
            {rooms.map((room) => (
              <div className="room-manage-card card" key={room._id}>
                <div className="room-manage-card__image">{room.type?.[0]?.toUpperCase()}</div>
                <div className="room-manage-card__body">
                  <p className="room-manage-card__title">{room.address}</p>
                  <p className="room-manage-card__sub">📍 {room.city} · <span className={`badge ${room.status === 'available' ? 'badge-success' : 'badge-danger'}`}>{room.status}</span></p>
                  <div className="room-manage-card__actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(room._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddRoomModal userId={user.userId} onClose={() => setShowModal(false)} onAdded={fetchRooms} />
      )}
    </div>
  );
}
