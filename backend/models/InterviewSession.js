const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Junior', 'Mid-Level', 'Senior'],
      default: 'Junior',
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'Behavioral', 'System Design', 'General'],
      default: 'Technical',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    questions: [
      {
        questionNumber: Number,
        question: String,
        userAnswer: String,
        feedback: String,
        score: Number,
        strengths: [String],
        improvements: [String],
      },
    ],
    overallScore: Number,
    strengths: [String],
    weakAreas: [String],
    improvementAdvice: [String],
    hindsightRetained: {
      type: Boolean,
      default: false,
    },
    hindsightMemorySummary: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
