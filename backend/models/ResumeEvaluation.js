const mongoose = require('mongoose');

const resumeEvaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      default: 'Uploaded-Resume.txt',
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    detectedRole: {
      type: String,
      default: 'Software Engineer',
    },
    detectedSkills: [String],
    missingSkills: [String],
    experienceSummary: String,
    education: [String],
    projects: [String],
    strengths: [String],
    improvements: [String],
    atsFeedback: [String],
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

module.exports = mongoose.model('ResumeEvaluation', resumeEvaluationSchema);
