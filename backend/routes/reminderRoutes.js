const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getReminders);
router.post('/', createReminder);
router.patch('/:id/toggle', toggleReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
