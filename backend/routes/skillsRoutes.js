const express = require('express');
const router = express.Router();
const { submitAssessment, getAssessmentHistory } = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');

router.post('/assessment', protect, submitAssessment);
router.get('/history', protect, getAssessmentHistory);

module.exports = router;
