const mongoose = require('mongoose');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');
const { generateQuizQuestions } = require('../services/ai');
const { retainCareerMemory } = require('../services/hindsight');
const { quizzes: memoryQuizzes, progressMap } = require('../utils/memoryDb');

/**
 * Generate Adaptive Quiz Questions
 * POST /api/quiz/generate
 */
async function generateQuiz(req, res) {
  try {
    const { skill = 'JavaScript', level = 'intermediate' } = req.body;
    const questions = await generateQuizQuestions({ skill, level });

    return res.json({
      success: true,
      skill,
      level,
      totalQuestions: questions.length,
      questions,
    });
  } catch (err) {
    console.error('[Quiz Generation Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: err.message,
    });
  }
}

/**
 * Submit Quiz Results
 * POST /api/quiz/result
 */
async function submitQuizResult(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { skill, level, answers } = req.body;

    if (!skill || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skill and answers array are required',
      });
    }

    let correctCount = 0;
    const weakTopics = [];
    const strongTopics = [];

    const evaluatedAnswers = answers.map((a) => {
      const isCorrect =
        a.userAnswer &&
        a.correctAnswer &&
        a.userAnswer.trim().toLowerCase() === a.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        correctCount += 1;
        if (a.topic && !strongTopics.includes(a.topic)) strongTopics.push(a.topic);
      } else {
        if (a.topic && !weakTopics.includes(a.topic)) weakTopics.push(a.topic);
      }

      return {
        question: a.question,
        userAnswer: a.userAnswer || 'No answer',
        correctAnswer: a.correctAnswer,
        isCorrect,
        explanation: a.explanation || '',
      };
    });

    const totalQuestions = evaluatedAnswers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const quizData = {
      _id: `quiz-${Date.now()}`,
      user: userId,
      skill,
      level: level || 'intermediate',
      score: correctCount,
      totalQuestions,
      percentage,
      weakTopics,
      strongTopics,
      answers: evaluatedAnswers,
      createdAt: new Date(),
    };

    let quizDoc = null;
    const isMongo = mongoose.connection.readyState === 1;

    if (isMongo) {
      try {
        quizDoc = await QuizResult.create(quizData);
        await Progress.findOneAndUpdate(
          { user: userId },
          {
            $inc: { quizzesTaken: 1 },
            $set: { averageQuizScore: percentage },
            $push: {
              milestones: {
                title: `Completed ${skill} Quiz (${percentage}%)`,
                category: 'Quiz',
                date: new Date(),
              },
            },
          },
          { upsert: true }
        );
      } catch (e) {
        quizDoc = quizData;
        memoryQuizzes.push(quizData);
      }
    } else {
      quizDoc = quizData;
      memoryQuizzes.push(quizData);

      const p = progressMap.get(userId) || { milestones: [] };
      p.quizzesTaken = (p.quizzesTaken || 0) + 1;
      p.averageQuizScore = percentage;
      p.milestones.push({
        title: `Completed ${skill} Quiz (${percentage}%)`,
        category: 'Quiz',
        date: new Date(),
      });
      progressMap.set(userId, p);
    }

    // Retain useful learning insights in Hindsight
    const quizMemory = `Quiz Result (${skill} - ${level}): Scored ${correctCount}/${totalQuestions} (${percentage}%). Demonstrated mastery in: ${
      strongTopics.join(', ') || 'Introductory concepts'
    }. Weak areas detected needing review: ${weakTopics.join(', ') || 'None (all questions correct)'}.`;

    const hindsightResult = await retainCareerMemory(userId, quizMemory, {
      tags: ['quiz_result', 'learning_insight', skill.toLowerCase().replace(/[^a-z0-9]/g, '_')],
      context: 'Adaptive Technical Assessment',
    });

    if (hindsightResult.success && quizDoc) {
      quizDoc.hindsightRetained = true;
      quizDoc.hindsightMemorySummary = quizMemory;
      if (typeof quizDoc.save === 'function') await quizDoc.save();
    }

    return res.status(201).json({
      success: true,
      result: quizDoc,
      hindsight: hindsightResult,
    });
  } catch (err) {
    console.error('[Quiz Submission Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record quiz results',
      error: err.message,
    });
  }
}

/**
 * Get Quiz History
 * GET /api/quiz/history
 */
async function getQuizHistory(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    let history = [];

    if (mongoose.connection.readyState === 1) {
      try {
        history = await QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
      } catch (e) {
        history = memoryQuizzes.filter((q) => q.user === userId);
      }
    } else {
      history = memoryQuizzes.filter((q) => q.user === userId);
    }

    return res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz history',
      error: err.message,
    });
  }
}

module.exports = {
  generateQuiz,
  submitQuizResult,
  getQuizHistory,
};
