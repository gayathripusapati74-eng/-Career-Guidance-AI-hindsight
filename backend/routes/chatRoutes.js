const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, sendMessage);
router.get('/chat/history', protect, getChatHistory);
router.delete('/chat/history', protect, clearChatHistory);

module.exports = router;
