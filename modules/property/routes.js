const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/rbacMiddleware');
const requireVerified = require('../../middleware/verifiedMiddleware');

const upload = multer({ dest: 'uploads/' });

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/properties  (canonical RESTful path, also supports legacy /all)
router.get('/',    controller.getAllRooms);
router.get('/all', controller.getAllRooms); // legacy alias

// Landlord-specific list — must come before /:id to avoid route conflict
router.get('/my', authMiddleware, authorize('landlord'), controller.getRoomsByLandlord);

// GET /api/properties/:id
router.get('/:id', authMiddleware, controller.getRoomById);

// ── Landlord-only (must be verified) ─────────────────────────────────────────
// POST /api/properties
router.post('/', authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.createRoom);

// PUT /api/properties/:id
router.put('/:id', authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.updateRoom);

// DELETE /api/properties/:id
router.delete('/:id', authMiddleware, authorize('landlord'), controller.deleteRoom);

// ── Legacy /user/:id aliases (backward-compat) ────────────────────────────────
router.post('/user/:id', authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.createRoomLegacy);
router.get('/user/:id',  authMiddleware, authorize('landlord'), controller.getRoomsByLandlordLegacy);
router.put('/user/:id',  authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.updateRoomLegacy);
router.delete('/user/:id', authMiddleware, authorize('landlord'), controller.deleteRoomLegacy);

module.exports = router;
