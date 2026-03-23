const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/rbacMiddleware');

const upload = multer({ dest: 'uploads/' });

// Tenant or landlord uploads their documents
router.post('/upload', authMiddleware, upload.array('documents', 5), controller.uploadDocuments);

// Any authenticated user can check a status (restrict to own or admin in middleware)
router.get('/status/:userId', authMiddleware, controller.getStatus);

// Admin reviews a verification record
router.put('/:id', authMiddleware, authorize('admin'), controller.reviewVerification);

module.exports = router;
