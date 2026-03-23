import React, { useState, useEffect } from 'react';
import Navbar from '../../shared/Navbar';
import { RowSkeleton } from '../../shared/Skeleton';
import { getBookings, updateBookingStatus } from '../../services/bookingService';
import './booking.css';

const statusBadge = (status) => {
  const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

const paymentBadge = (status) => {
  const map = { paid: 'badge-success', unpaid: 'badge-warning', refunded: 'badge-info' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getBookings({ page, limit: pagination.limit });
      const { bookings: data, total, page: p, limit } = res.data.data;
      setBookings(data);
      setPagination({ total, page: p, limit });
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(1); }, []); // eslint-disable-line

  const handleStatus = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status } : b));
    } catch {
      alert('Failed to update booking status.');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="dashboard-header">
          <div>
            <h1>Booking Requests</h1>
            <p className="text-muted">{pagination.total} total requests</p>
          </div>
        </div>

        {error && <div className="error-state"><p>{error}</p></div>}

        {loading ? (
          <RowSkeleton rows={5} />
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No booking requests</h3>
            <p>Requests from tenants will appear here</p>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div className="booking-card card" key={booking._id}>
                <div className="booking-card__info">
                  <div className="booking-card__tenant">
                    <div className="booking-card__avatar">
                      {booking.tenantId?.name?.[0]?.toUpperCase() ?? 'T'}
                    </div>
                    <div>
                      <p className="booking-card__name">{booking.tenantId?.name}</p>
                      <p className="booking-card__email">{booking.tenantId?.email}</p>
                    </div>
                  </div>

                  <div className="booking-card__property">
                    <p className="booking-card__prop-type">{booking.propertyId?.type}</p>
                    <p className="booking-card__prop-addr">
                      {booking.propertyId?.address}, {booking.propertyId?.city}
                    </p>
                  </div>

                  <div className="booking-card__statuses">
                    <div>
                      <span className="booking-card__label">Booking</span>
                      {statusBadge(booking.status)}
                    </div>
                    <div>
                      <span className="booking-card__label">Payment</span>
                      {paymentBadge(booking.paymentStatus)}
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-card__actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatus(booking._id, 'approved')}
                      disabled={updating === booking._id}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatus(booking._id, 'rejected')}
                      disabled={updating === booking._id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" onClick={() => fetchBookings(pagination.page - 1)} disabled={pagination.page <= 1}>
              ← Prev
            </button>
            <span>Page {pagination.page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => fetchBookings(pagination.page + 1)} disabled={pagination.page >= totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
