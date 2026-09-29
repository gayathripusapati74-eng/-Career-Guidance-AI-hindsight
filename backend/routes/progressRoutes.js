const express = require('express');
const router = express.Router();
const { getProgressDashboard, triggerHindsightReflect } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgressDashboard);
router.post('/reflect', protect, triggerHindsightReflect);

module.exports = router;
