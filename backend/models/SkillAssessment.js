const mongoose = require('mongoose');

const skillAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Comprehensive Assessment',
    },
    skills: [
      {
        skill: { type: String, required: true },
        score: { type: Number, required: true },
        maxScore: { type: Number, default: 100 },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
        details: [String],
      },
    ],
    overallScore: {
      type: Number,
      required: true,
    },
    strengths: [String],
    weakAreas: [String],
    recommendations: [String],
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

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);
