const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    skillAssessmentsCount: {
      type: Number,
      default: 0,
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    interviewsCompleted: {
      type: Number,
      default: 0,
    },
    averageSkillScore: {
      type: Number,
      default: 0,
    },
    averageQuizScore: {
      type: Number,
      default: 0,
    },
    averageInterviewScore: {
      type: Number,
      default: 0,
    },
    resumeScore: {
      type: Number,
      default: 0,
    },
    completedRoadmapPhases: {
      type: Number,
      default: 0,
    },
    totalRoadmapPhases: {
      type: Number,
      default: 0,
    },
    milestones: [
      {
        title: { type: String, required: true },
        category: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    hindsightReflections: [
      {
        date: { type: Date, default: Date.now },
        query: String,
        reflectionText: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Progress', progressSchema);
