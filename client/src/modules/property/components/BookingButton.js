import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../../services/bookingService';
import { startConversation } from '../../../services/chatService';
import { useAuth } from '../../../shared/hooks/useAuth';
import styles from '../detail.module.css';

/**
 * BookingButton — sticky sidebar card with Book + Chat actions.
 *
 * @param {Object}  property   - full room document
 * @param {Function} onBooked  - called after successful booking
 */
export default function BookingButton({ property, onBooked }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking,  setBooking]  = useState(false);
  const [chatting, setChatting] = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  const isOccupied = property.status === 'occupied';
  const landlordId = property.landlord?._id ?? property.landlord;

  const handleBook = async () => {
    setError('');
    setSuccess('');
    setBooking(true);
    try {
      await createBooking(property._id);
      setSuccess('Booking request sent! The landlord will review it shortly.');
      onBooked?.();
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const handleChat = async () => {
    if (!landlordId) return;
    setChatting(true);
    try {
      await startConversation(landlordId);
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Could not start conversation.');
      setChatting(false);
    }
  };

  return (
    <div className={styles.bookingCard}>
      <p className={styles.bookingCardTitle}>
        {isOccupied ? 'This property is occupied' : 'Ready to move in?'}
      </p>

      {property.rent != null && (
        <>
          <div className={styles.bookingRent}>
            ₹{property.rent.toLocaleString('en-IN')}
          </div>
          <div className={styles.bookingRentSub}>per month</div>
        </>
      )}

      {success && (
        <div className={styles.bookingSuccess} role="status">✓ {success}</div>
      )}
      {error && (
        <div className={styles.bookingError} role="alert">⚠ {error}</div>
      )}

      <button
        className={[styles.bookBtn, isOccupied ? styles.bookBtnOccupied : ''].join(' ')}
        onClick={handleBook}
        disabled={isOccupied || booking || !!success}
        aria-label={isOccupied ? 'Property is occupied' : 'Book this property'}
      >
        {booking
          ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> Booking…</>
          : isOccupied ? '✗ Occupied'
          : success    ? '✓ Request Sent'
          : '🏠 Book Now'
        }
      </button>

      {user && landlordId && user.userId !== landlordId.toString() && (
        <button
          className={styles.chatBtn}
          onClick={handleChat}
          disabled={chatting}
          aria-label="Message the landlord"
        >
          {chatting ? 'Opening chat…' : '💬 Message Landlord'}
        </button>
      )}

      <p className={styles.bookingNote}>
        {isOccupied
          ? 'Check back later or explore similar properties.'
          : 'No payment required now. The landlord will confirm your request.'}
      </p>
    </div>
  );
}
