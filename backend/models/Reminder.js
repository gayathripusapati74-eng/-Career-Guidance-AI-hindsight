const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['academic', 'mentoring', 'attendance', 'placement', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    relatedStudentId: {
      type: String,
      default: null,
      index: true,
    },
    relatedStudentName: {
      type: String,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['manual', 'ai_copilot', 'system_alert'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ user: 1, isCompleted: 1, dueDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
