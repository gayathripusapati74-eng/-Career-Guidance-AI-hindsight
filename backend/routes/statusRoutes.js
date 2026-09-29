const express = require('express');
const router = express.Router();
const { getSystemStatus, updateConfig } = require('../controllers/statusController');

// Public status probe endpoint for health checks & demo verification
router.get('/', getSystemStatus);

// Update runtime config (e.g. paste Hindsight API Key)
router.post('/config', updateConfig);

module.exports = router;
