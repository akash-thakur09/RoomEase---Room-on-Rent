const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/rbacMiddleware');
const requireVerified = require('../../middleware/verifiedMiddleware');

const upload = multer({ dest: 'uploads/' });

// Public
router.get('/all', controller.getAllRooms);
router.get('/:id', authMiddleware, controller.getRoomById);

// Landlord-only (must be verified)
router.post('/user/:id', authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.createRoom);
router.get('/user/:id', authMiddleware, authorize('landlord'), controller.getRoomsByLandlord);
router.put('/user/:id', authMiddleware, authorize('landlord'), requireVerified, upload.array('photos', 5), controller.updateRoom);
router.delete('/user/:id', authMiddleware, authorize('landlord'), controller.deleteRoom);

module.exports = router;
