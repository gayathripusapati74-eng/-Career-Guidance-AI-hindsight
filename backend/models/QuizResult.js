const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    weakTopics: [String],
    strongTopics: [String],
    answers: [
      {
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
      },
    ],
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

module.exports = mongoose.model('QuizResult', quizResultSchema);
