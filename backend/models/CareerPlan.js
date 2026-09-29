const mongoose = require('mongoose');

const careerPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goal: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: String,
      default: 'Beginner',
    },
    estimatedDuration: {
      type: String,
      default: '6 Months',
    },
    phases: [
      {
        phaseNumber: { type: Number, required: true },
        title: { type: String, required: true },
        duration: String,
        description: String,
        skills: [String],
        milestones: [String],
        resources: [String],
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
    },
    generatedFromMemories: {
      type: Boolean,
      default: false,
    },
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

module.exports = mongoose.model('CareerPlan', careerPlanSchema);
