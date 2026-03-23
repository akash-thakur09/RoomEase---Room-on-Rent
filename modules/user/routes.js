const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Unified profile routes — works for both tenant and landlord
router.get('/profile/:id', authMiddleware, controller.getProfile);
router.put('/profile/:id', authMiddleware, controller.updateProfile);
router.delete('/profile/:email', authMiddleware, controller.deleteAccount);
router.post('/profile/photo/:id', authMiddleware, upload.single('profilePhoto'), controller.uploadProfilePhoto);

// Tenant-specific: get rented room
router.get('/profile/room/:id', authMiddleware, controller.getTenantRoom);

module.exports = router;
