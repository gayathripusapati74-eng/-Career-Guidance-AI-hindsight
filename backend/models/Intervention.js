const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    interventionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    concernType: {
      type: String,
      enum: ['academic', 'placement', 'attendance', 'comprehensive', 'wellbeing'],
      required: true,
    },
    concernTitle: {
      type: String,
      required: true,
    },
    concernDescription: {
      type: String,
      required: true,
    },
    evidence: [
      {
        indicator: String,
        value: String,
        dateObserved: Date,
        threshold: String,
      },
    ],
    recommendedAction: {
      type: String,
      required: true,
    },
    actionCategory: {
      type: String,
      enum: [
        'Academic Tutoring',
        'Attendance Counselling',
        'Subject-Specific Support',
        'Coding Practice Plan',
        'Aptitude Preparation',
        'Mock Interview',
        'Resume Review',
        'Faculty Check-in',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    mentorAssigned: {
      type: String,
      required: true,
      default: 'Dr. S. Sharma',
    },
    dateAssigned: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Completed', 'Overdue', 'Dismissed'],
      default: 'Pending',
      index: true,
    },
    notes: [
      {
        author: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    baselineIndicators: {
      gpa: Number,
      attendance: Number,
      codingScore: Number,
      aptitudeScore: Number,
      successScore: Number,
      capturedAt: { type: Date, default: Date.now },
    },
    followUpIndicators: {
      gpa: Number,
      attendance: Number,
      codingScore: Number,
      aptitudeScore: Number,
      successScore: Number,
      measuredAt: Date,
    },
    observedChanges: {
      attendanceDelta: Number,
      academicDelta: Number,
      codingDelta: Number,
      successScoreDelta: Number,
      qualitativeSummary: String,
    },
    outcomeReview: {
      effective: { type: Boolean, default: null },
      summary: String,
      reviewedBy: String,
      reviewedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Intervention', interventionSchema);
