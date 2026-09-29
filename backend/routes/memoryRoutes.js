const express = require('express');
const router = express.Router();
const { retain, recall, reflect, getStatus } = require('../controllers/memoryController');
const { protect } = require('../middleware/auth');

router.post('/retain', protect, retain);
router.post('/recall', protect, recall);
router.post('/reflect', protect, reflect);
router.get('/status', protect, getStatus);

module.exports = router;
