const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmap, updatePhaseStatus } = require('../controllers/careerController');
const { protect } = require('../middleware/auth');

router.post('/roadmap', protect, generateRoadmap);
router.get('/roadmap', protect, getRoadmap);
router.put('/roadmap/phase', protect, updatePhaseStatus);

module.exports = router;
