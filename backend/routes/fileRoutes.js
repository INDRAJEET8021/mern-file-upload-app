const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

// Upload Route
router.post('/upload', protect, uploadFile);

module.exports = router;
