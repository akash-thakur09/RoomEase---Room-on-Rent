import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import '../css/RoomSearch.css';
import SharingRoomPhoto from '../data/sharing.avif';
import axios from 'axios';

const ExploreRoom = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit });
      if (selectedCity)    params.append('city', selectedCity);
      if (selectedRoomType) params.append('type', selectedRoomType);

      const response = await axios.get(`/api/properties?${params.toString()}`);
      const { rooms: data, total, page: currentPage, limit } = response.data.data;
      setRooms(data);
      setPagination({ total, page: currentPage, limit });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedRoomType, pagination.limit]);

  useEffect(() => {
    fetchRooms(1);
  }, [selectedCity, selectedRoomType]); // eslint-disable-line react-hooks/exhaustive-deps

  const book = async (propertyId) => {
    try {
      await axios.post(
        '/api/bookings',
        { propertyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Booking request sent successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <Navbar />
      <div className="explore-room-page" style={{ overflow: 'auto' }}>
        <div className="search-box">
          <div className="city-selection">
            <h3>City:</h3>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="">All Cities</option>
              <option value="indore">Indore</option>
              <option value="bhopal">Bhopal</option>
            </select>
          </div>
          <div className="room-type-filter">
            <h3>Room Type:</h3>
            <select value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)}>
              <option value="">All Types</option>
              <option value="single">Single Room</option>
              <option value="sharing">Sharing Room</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <>
            <div className="room-list">
              {rooms.map((room) => (
                <div className="room-card" key={room._id}>
                  <div className="forImage">
                    <img src={SharingRoomPhoto} alt="Room" className="Room-photo" />
                  </div>
                  <div className="roomDetails">
                    <p>Type: {room.type}</p>
                    <p>Address: {room.address}</p>
                    <p>City: {room.city}</p>
                    <p>Status: {room.status}</p>
                    <button
                      className="searchBookBtn"
                      onClick={() => book(room._id)}
                      disabled={room.status === 'occupied'}
                    >
                      {room.status === 'occupied' ? 'Occupied' : 'Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ textAlign: 'center', margin: '20px 0' }}>
                <button
                  onClick={() => fetchRooms(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Prev
                </button>
                <span style={{ margin: '0 12px' }}>
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => fetchRooms(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExploreRoom;
