const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const { reminders: memoryReminders, students: memoryStudents } = require('../utils/memoryDb');

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

const PRIORITY_WEIGHT = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * GET /api/reminders
 * Retrieve user's reminders
 */
async function getReminders(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { isCompleted, category } = req.query;

    let items = [];

    if (isMongoActive()) {
      const query = { user: userId };
      if (isCompleted !== undefined) {
        query.isCompleted = isCompleted === 'true';
      }
      if (category) {
        query.category = category;
      }
      items = await Reminder.find(query).sort({ isCompleted: 1, dueDate: 1, createdAt: -1 }).lean();
    } else {
      items = Array.from(memoryReminders.values()).filter((r) => String(r.user) === userId);
      if (isCompleted !== undefined) {
        const boolVal = isCompleted === 'true';
        items = items.filter((r) => Boolean(r.isCompleted) === boolVal);
      }
      if (category) {
        items = items.filter((r) => r.category === category);
      }

      // Sort: pending first, then by priority weight desc, then dueDate asc
      items.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        const pDiff = (PRIORITY_WEIGHT[b.priority] || 2) - (PRIORITY_WEIGHT[a.priority] || 2);
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    const allUserItems = isMongoActive()
      ? await Reminder.find({ user: userId }).lean()
      : Array.from(memoryReminders.values()).filter((r) => String(r.user) === userId);

    const pendingCount = allUserItems.filter((r) => !r.isCompleted).length;
    const completedCount = allUserItems.filter((r) => r.isCompleted).length;

    return res.json({
      success: true,
      count: items.length,
      pendingCount,
      completedCount,
      reminders: items,
    });
  } catch (err) {
    console.error('[Get Reminders Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reminders', error: err.message });
  }
}

/**
 * POST /api/reminders
 * Create a new persistent reminder
 */
async function createReminder(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const {
      title,
      description,
      category = 'general',
      priority = 'medium',
      dueDate,
      relatedStudentId,
      relatedStudentName,
      source = 'manual',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Reminder title is required' });
    }

    // Role-based boundary check on student attribution
    if (relatedStudentId) {
      if (req.user.role === 'student' && req.user.studentId && req.user.studentId !== relatedStudentId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Students cannot create reminders referencing other students.',
        });
      }

      if (req.user.role === 'faculty') {
        const student = memoryStudents.get(relatedStudentId);
        if (student) {
          const facDept = req.user.department;
          const facMentor = req.user.assignedMentor;
          const matchesMentor = facMentor && student.assignedMentor === facMentor;
          const matchesDept = facDept && (student.department === facDept || student.department.toLowerCase().includes(facDept.toLowerCase()));
          if (!matchesMentor && !matchesDept) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: Faculty can only link reminders to students in their assigned department or cohort.',
            });
          }
        }
      }
    }

    const reminderDoc = {
      _id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: ['academic', 'mentoring', 'attendance', 'placement', 'general'].includes(category) ? category : 'general',
      priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      relatedStudentId: relatedStudentId || null,
      relatedStudentName: relatedStudentName || null,
      isCompleted: false,
      completedAt: null,
      source,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoActive()) {
      const created = await Reminder.create({
        ...reminderDoc,
        user: req.user._id,
      });
      return res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        reminder: created,
      });
    }

    memoryReminders.set(reminderDoc._id, reminderDoc);

    return res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      reminder: reminderDoc,
    });
  } catch (err) {
    console.error('[Create Reminder Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create reminder', error: err.message });
  }
}

/**
 * PATCH /api/reminders/:id/toggle
 * Toggle completion status
 */
async function toggleReminder(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { id } = req.params;

    if (isMongoActive()) {
      const item = await Reminder.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }
      if (String(item.user) !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this reminder' });
      }

      item.isCompleted = !item.isCompleted;
      item.completedAt = item.isCompleted ? new Date() : null;
      await item.save();

      return res.json({
        success: true,
        message: `Reminder marked as ${item.isCompleted ? 'completed' : 'pending'}`,
        reminder: item,
      });
    }

    const item = memoryReminders.get(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    if (String(item.user) !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this reminder' });
    }

    item.isCompleted = !item.isCompleted;
    item.completedAt = item.isCompleted ? new Date() : null;
    item.updatedAt = new Date();
    memoryReminders.set(id, item);

    return res.json({
      success: true,
      message: `Reminder marked as ${item.isCompleted ? 'completed' : 'pending'}`,
      reminder: item,
    });
  } catch (err) {
    console.error('[Toggle Reminder Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update reminder', error: err.message });
  }
}

/**
 * DELETE /api/reminders/:id
 * Delete reminder
 */
async function deleteReminder(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { id } = req.params;

    if (isMongoActive()) {
      const item = await Reminder.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }
      if (String(item.user) !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this reminder' });
      }

      await Reminder.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Reminder deleted successfully' });
    }

    const item = memoryReminders.get(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    if (String(item.user) !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this reminder' });
    }

    memoryReminders.delete(id);
    return res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (err) {
    console.error('[Delete Reminder Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete reminder', error: err.message });
  }
}

module.exports = {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
};
