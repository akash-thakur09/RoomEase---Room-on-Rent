import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../shared/components/Navbar/Navbar';
import { CardSkeleton } from '../../shared/components/Skeleton';
import { getProperties } from '../../services/propertyService';
import { createBooking } from '../../services/bookingService';
import './property.css';

const CITIES = ['', 'indore', 'bhopal', 'mumbai', 'delhi', 'pune'];
const TYPES = ['', 'single', 'sharing', 'apartment'];

const statusBadge = (status) => {
  const map = { available: 'badge-success', occupied: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

export default function PropertyListing() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ city: '', type: '' });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);

  const fetchRooms = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getProperties(params);
      const { rooms: data, total, page: p, limit } = res.data.data;
      setRooms(data);
      setPagination({ total, page: p, limit });
    } catch (err) {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => { fetchRooms(1); }, [filters]); // eslint-disable-line

  const handleBook = async (propertyId) => {
    setBookingId(propertyId);
    try {
      await createBooking(propertyId);
      alert('Booking request sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="property-header">
          <h1>Explore Rooms</h1>
          <p className="text-muted">{pagination.total} properties available</p>
        </div>

        <div className="filter-bar card">
          <div className="filter-group">
            <label>City</label>
            <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              <option value="">All Cities</option>
              {CITIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Room Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              {TYPES.filter(Boolean).map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-state"><p>{error}</p></div>}

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <h3>No properties found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid-3">
            {rooms.map((room) => (
              <div className="property-card card" key={room._id}>
                <div className="property-card__image">
                  {room.photos?.[0]
                    ? <img src={`/uploads/${room.photos[0]}`} alt={room.type} />
                    : <div className="property-card__image-placeholder">{room.type?.[0]?.toUpperCase()}</div>
                  }
                  <div className="property-card__type-badge">{room.type}</div>
                </div>
                <div className="property-card__body">
                  <div className="property-card__meta">
                    {statusBadge(room.status)}
                  </div>
                  <h3 className="property-card__address">{room.address}</h3>
                  <p className="property-card__city">📍 {room.city}</p>
                  {room.rent && <p className="property-card__rent">₹{room.rent}/mo</p>}
                  <button
                    className={`btn btn-primary btn-sm property-card__btn`}
                    onClick={() => handleBook(room._id)}
                    disabled={room.status === 'occupied' || bookingId === room._id}
                  >
                    {bookingId === room._id ? 'Booking…' : room.status === 'occupied' ? 'Occupied' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" onClick={() => fetchRooms(pagination.page - 1)} disabled={pagination.page <= 1}>
              ← Prev
            </button>
            <span>Page {pagination.page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => fetchRooms(pagination.page + 1)} disabled={pagination.page >= totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
