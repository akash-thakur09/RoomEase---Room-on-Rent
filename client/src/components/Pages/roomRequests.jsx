import React, { useState, useEffect } from 'react';
import Navbar from './llnavbar';
import '../css/RoomSearch.css';
import axios from 'axios';

const RoomRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchBookings = async (page = 1) => {
    try {
      const response = await axios.get(`/api/bookings?page=${page}&limit=${pagination.limit}`, {
        headers: authHeader,
      });
      const { bookings: data, total, page: currentPage, limit } = response.data.data;
      setBookings(data);
      setPagination({ total, page: currentPage, limit });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}`, { status }, { headers: authHeader });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <Navbar />
      <div className="requestPage">
        <div className="room-list_requestPage">
          {bookings.map((booking) => (
            <div className="room-card_requestPage" key={booking._id} style={{ width: '600px' }}>
              <div className="roomDetails">
                <p className="lable">Tenant:</p>
                <p className="inputFields">
                  {booking.tenantId?.name} ({booking.tenantId?.email})
                </p>

                <p className="lable">Property:</p>
                <p className="inputFields">
                  {booking.propertyId?.type} — {booking.propertyId?.address}, {booking.propertyId?.city}
                </p>

                <p className="lable">Booking Status:</p>
                <p className="inputFields">{booking.status}</p>

                <p className="lable">Payment Status:</p>
                <p className="inputFields">{booking.paymentStatus}</p>
              </div>
              {booking.status === 'pending' && (
                <div className="updateButtons_box">
                  <button
                    className="updateAndDelete_btn"
                    onClick={() => updateStatus(booking._id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="updateAndDelete_btn"
                    onClick={() => updateStatus(booking._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              onClick={() => fetchBookings(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Prev
            </button>
            <span style={{ margin: '0 12px' }}>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => fetchBookings(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomRequests;
