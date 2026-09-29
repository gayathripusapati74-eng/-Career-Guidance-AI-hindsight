const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const SkillAssessment = require('../models/SkillAssessment');
const ResumeEvaluation = require('../models/ResumeEvaluation');
const CareerPlan = require('../models/CareerPlan');
const QuizResult = require('../models/QuizResult');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');
const { reflectCareerGuidance } = require('../services/hindsight');
const {
  users: memoryUsers,
  assessments: memoryAssessments,
  resumes: memoryResumes,
  plans: memoryPlans,
  quizzes: memoryQuizzes,
  interviews: memoryInterviews,
  progressMap,
} = require('../utils/memoryDb');

/**
 * Get Comprehensive Progress Dashboard Data
 * GET /api/progress
 */
async function getProgressDashboard(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const isMongo = mongoose.connection.readyState === 1;

    let user = req.user;
    let progressDoc = null;
    let latestAssessment = null;
    let latestResume = null;
    let careerPlan = null;
    let recentQuizzes = [];
    let recentInterviews = [];

    if (isMongo) {
      try {
        [user, progressDoc, latestAssessment, latestResume, careerPlan, recentQuizzes, recentInterviews] =
          await Promise.all([
            User.findById(userId).select('-password'),
            Progress.findOne({ user: userId }),
            SkillAssessment.findOne({ user: userId }).sort({ createdAt: -1 }),
            ResumeEvaluation.findOne({ user: userId }).sort({ createdAt: -1 }),
            CareerPlan.findOne({ user: userId }),
            QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
            InterviewSession.find({ user: userId, status: 'completed' }).sort({ createdAt: -1 }).limit(5),
          ]);
      } catch (e) {
        // fallback
      }
    }

    if (!user) user = memoryUsers.get(userId) || req.user;
    if (!progressDoc) progressDoc = progressMap.get(userId) || null;
    if (!latestAssessment) latestAssessment = memoryAssessments.filter((a) => a.user === userId).slice(-1)[0] || null;
    if (!latestResume) latestResume = memoryResumes.filter((r) => r.user === userId).slice(-1)[0] || null;
    if (!careerPlan) careerPlan = memoryPlans.get(userId) || null;
    if (!recentQuizzes || recentQuizzes.length === 0) {
      recentQuizzes = memoryQuizzes.filter((q) => q.user === userId).slice(-5);
    }
    if (!recentInterviews || recentInterviews.length === 0) {
      recentInterviews = Array.from(memoryInterviews.values()).filter((i) => i.user === userId && i.status === 'completed').slice(-5);
    }

    const roadmapPhases = careerPlan?.phases || [];
    const completedPhasesCount = roadmapPhases.filter((p) => p.status === 'completed').length;
    const roadmapProgressPercentage =
      roadmapPhases.length > 0
        ? Math.round((completedPhasesCount / roadmapPhases.length) * 100)
        : 0;

    const skillScore = latestAssessment?.overallScore || (user.currentSkills?.length > 0 ? 65 : 0);
    const resumeScore = latestResume?.atsScore || 0;
    const quizAvg =
      recentQuizzes.length > 0
        ? Math.round(recentQuizzes.reduce((s, q) => s + q.percentage, 0) / recentQuizzes.length)
        : 0;
    const interviewAvg =
      recentInterviews.length > 0
        ? Math.round(recentInterviews.reduce((s, i) => s + (i.overallScore || 0), 0) / recentInterviews.length)
        : 0;

    const overallReadiness = Math.round(
      (skillScore * 0.3) +
      (resumeScore * 0.2) +
      (quizAvg * 0.2) +
      (interviewAvg * 0.15) +
      (roadmapProgressPercentage * 0.15)
    );

    return res.json({
      success: true,
      stats: {
        careerGoal: user.careerGoal || 'Full Stack Developer',
        targetRole: user.targetRole || 'Full Stack Developer',
        overallReadiness,
        skillScore,
        resumeScore,
        quizAverage: quizAvg,
        interviewAverage: interviewAvg,
        completedPhasesCount,
        totalPhasesCount: roadmapPhases.length,
        roadmapProgressPercentage,
        assessmentsCount: progressDoc?.skillAssessmentsCount || (latestAssessment ? 1 : 0),
        quizzesCount: progressDoc?.quizzesTaken || recentQuizzes.length,
        interviewsCount: progressDoc?.interviewsCompleted || recentInterviews.length,
      },
      currentSkills: user.currentSkills || [],
      latestAssessment,
      latestResume,
      careerPlan,
      recentQuizzes,
      recentInterviews,
      milestones: progressDoc?.milestones || [],
      lastReflection: progressDoc?.hindsightReflections?.slice(-1)[0] || null,
    });
  } catch (err) {
    console.error('[Progress Dashboard Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load progress dashboard',
      error: err.message,
    });
  }
}

/**
 * Trigger Hindsight Reflect on User's Long-term Career Memories
 * POST /api/progress/reflect
 */
async function triggerHindsightReflect(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { query = 'How have I improved over time and what is my current career readiness trajectory?' } =
      req.body;

    console.log(`[Progress Reflect] Running Hindsight Reflect for user: ${userId}`);

    // Call official Hindsight Reflect
    const reflectResult = await reflectCareerGuidance(userId, query, {
      context:
        'Synthesize candidate technical skill improvements, quiz performance, interview growth, and remaining roadmap steps.',
    });

    if (reflectResult.success && reflectResult.reflection) {
      if (mongoose.connection.readyState === 1) {
        try {
          await Progress.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                hindsightReflections: {
                  date: new Date(),
                  query,
                  reflectionText: reflectResult.reflection,
                },
              },
            },
            { upsert: true }
          );
        } catch (e) {
          // fallback
        }
      }
      const p = progressMap.get(userId) || { hindsightReflections: [] };
      if (!p.hindsightReflections) p.hindsightReflections = [];
      p.hindsightReflections.push({
        date: new Date(),
        query,
        reflectionText: reflectResult.reflection,
      });
      progressMap.set(userId, p);
    }

    return res.json({
      success: reflectResult.success,
      configured: reflectResult.configured,
      bankId: reflectResult.bankId,
      query,
      reflection: reflectResult.reflection,
      basedOn: reflectResult.basedOn,
      error: reflectResult.error,
    });
  } catch (err) {
    console.error('[Reflect Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Hindsight reflection',
      error: err.message,
    });
  }
}

module.exports = {
  getProgressDashboard,
  triggerHindsightReflect,
};
