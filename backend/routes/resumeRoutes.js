const express = require('express');
const multer = require('multer');
const router = express.Router();
const { evaluateResume, getLatestEvaluation } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

router.post('/evaluate', protect, upload.single('resumeFile'), evaluateResume);
router.get('/latest', protect, getLatestEvaluation);

module.exports = router;
