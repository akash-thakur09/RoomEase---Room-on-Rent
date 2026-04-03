const Room    = require('../property/model');
const Booking = require('../booking/model');
const Payment = require('../payment/model');

/**
 * GET /api/landlord/stats
 * Returns aggregated dashboard data for the authenticated landlord.
 */
const getStats = async (req, res) => {
  try {
    const landlordId = req.user.id;

    // ── Properties ────────────────────────────────────────────────────────
    const [recentProperties, totalProperties, availableCount, occupiedCount] = await Promise.all([
      Room.find({ landlord: landlordId }).sort({ createdAt: -1 }).limit(6),
      Room.countDocuments({ landlord: landlordId }),
      Room.countDocuments({ landlord: landlordId, status: 'available' }),
      Room.countDocuments({ landlord: landlordId, status: 'occupied' }),
    ]);

    // ── Bookings ──────────────────────────────────────────────────────────
    const [recentBookings, totalBookings] = await Promise.all([
      Booking.find({ landlordId })
        .populate('tenantId',   'name email profilePhoto')
        .populate('propertyId', 'type address city rent')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.countDocuments({ landlordId }),
    ]);

    const pendingCount   = await Booking.countDocuments({ landlordId, status: 'pending' });
    const approvedCount  = await Booking.countDocuments({ landlordId, status: 'approved' });
    const completedCount = await Booking.countDocuments({ landlordId, status: 'completed' });

    // ── Earnings (from paid bookings via Payment model) ───────────────────
    // Get all booking IDs for this landlord
    const allBookingIds = await Booking.find({ landlordId }).distinct('_id');

    const earningsAgg = await Payment.aggregate([
      { $match: { bookingId: { $in: allBookingIds }, status: 'success' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalPaid:     { $sum: 1 },
        },
      },
    ]);

    // Monthly earnings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          bookingId: { $in: allBookingIds },
          status: 'success',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amount' },
          count:  { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const earnings = earningsAgg[0] ?? { totalEarnings: 0, totalPaid: 0 };

    return res.json({
      success: true,
      message: 'Stats fetched',
      data: {
        properties: {
          total:     totalProperties,
          available: availableCount,
          occupied:  occupiedCount,
          recent:    recentProperties,
        },
        bookings: {
          total:     totalBookings,
          pending:   pendingCount,
          approved:  approvedCount,
          completed: completedCount,
          recent:    recentBookings,
        },
        earnings: {
          total:   earnings.totalEarnings,   // paise
          paid:    earnings.totalPaid,
          monthly: monthlyEarnings,
        },
      },
    });
  } catch (err) {
    console.error('[landlord/stats]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats };
