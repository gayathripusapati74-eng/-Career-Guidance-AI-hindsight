const express = require('express');
const router = express.Router();
const { getJobs } = require('../controllers/jobsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);

module.exports = router;
