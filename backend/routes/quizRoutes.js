const express = require('express');
const router = express.Router();
const { generateQuiz, submitQuizResult, getQuizHistory } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateQuiz);
router.post('/result', protect, submitQuizResult);
router.get('/history', protect, getQuizHistory);

module.exports = router;
