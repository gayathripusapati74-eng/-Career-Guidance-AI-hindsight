const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession');
const Progress = require('../models/Progress');
const { evaluateInterviewAnswer } = require('../services/ai');
const { retainCareerMemory } = require('../services/hindsight');
const { interviews: memoryInterviews, progressMap } = require('../utils/memoryDb');

const INITIAL_QUESTIONS = {
  Technical: {
    'Frontend Developer': 'How does React reconciliation and the Virtual DOM diffing algorithm optimize browser rendering performance?',
    'Full Stack Developer': 'Walk me through how you design and implement a secure, stateless authentication flow using JWTs in a Node.js and React application.',
    'Backend Developer': 'How do you design database schemas to balance normalization and read query performance under heavy write loads?',
  },
  Behavioral: {
    'Frontend Developer': 'Tell me about a time you faced a contentious disagreement with a product designer or backend engineer over technical constraints. How did you resolve it?',
    'Full Stack Developer': 'Describe a complex production bug that occurred on a project you deployed. How did you triage, identify the root cause, and prevent regressions?',
    'Backend Developer': 'Share an example of a situation where a critical database query was causing production timeouts. How did you diagnose and remediate it?',
  },
  'System Design': {
    'Frontend Developer': 'How would you architect a high-scale real-time collaboration tool (like Figma or Google Docs) on the frontend?',
    'Full Stack Developer': 'Design a scalable URL shortening service (like Bitly) supporting 100M daily clicks with analytics and high availability.',
    'Backend Developer': 'Design a distributed rate-limiting middleware capable of handling 50,000 requests per second across a multi-region cluster.',
  },
};

/**
 * Start Mock Interview Session
 * POST /api/interview/start
 */
async function startInterview(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { role = 'Full Stack Developer', experienceLevel = 'Junior', interviewType = 'Technical' } = req.body;

    const roleQuestions = INITIAL_QUESTIONS[interviewType] || INITIAL_QUESTIONS['Technical'];
    const initialQuestion =
      roleQuestions[role] ||
      roleQuestions['Full Stack Developer'] ||
      `Can you explain your experience and architectural approach as a ${experienceLevel} ${role}?`;

    const isMongo = mongoose.connection.readyState === 1;
    let session = null;
    const sessionId = `interview-${Date.now()}`;

    const sessionData = {
      _id: sessionId,
      user: userId,
      role,
      experienceLevel,
      interviewType,
      status: 'in_progress',
      questions: [
        {
          questionNumber: 1,
          question: initialQuestion,
        },
      ],
      createdAt: new Date(),
    };

    if (isMongo) {
      try {
        session = await InterviewSession.create(sessionData);
      } catch (e) {
        session = sessionData;
        memoryInterviews.set(sessionId, sessionData);
      }
    } else {
      session = sessionData;
      memoryInterviews.set(sessionId, sessionData);
    }

    return res.status(201).json({
      success: true,
      sessionId: session._id || sessionId,
      role,
      experienceLevel,
      interviewType,
      questionNumber: 1,
      totalQuestions: 4,
      question: initialQuestion,
    });
  } catch (err) {
    console.error('[Interview Start Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to start interview session',
      error: err.message,
    });
  }
}

/**
 * Submit Answer & Receive Instant Evaluation / Next Question
 * POST /api/interview/answer
 */
async function submitAnswer(req, res) {
  try {
    const { sessionId, answer, questionNumber = 1 } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and candidate answer are required',
      });
    }

    const isMongo = mongoose.connection.readyState === 1;
    let session = null;

    if (isMongo) {
      try {
        session = await InterviewSession.findById(sessionId);
      } catch (e) {
        session = null;
      }
    }

    if (!session) {
      session = memoryInterviews.get(sessionId);
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const currentQ = session.questions.find((q) => q.questionNumber === Number(questionNumber));
    if (!currentQ) {
      return res.status(404).json({ success: false, message: `Question ${questionNumber} not found` });
    }

    // AI Evaluation of Answer
    const evaluation = await evaluateInterviewAnswer({
      role: session.role,
      level: session.experienceLevel,
      type: session.interviewType,
      question: currentQ.question,
      answer,
      questionNumber,
    });

    currentQ.userAnswer = answer;
    currentQ.feedback = evaluation.feedback;
    currentQ.score = evaluation.score;
    currentQ.strengths = evaluation.strengths;
    currentQ.improvements = evaluation.improvements;

    const isLastQuestion = Number(questionNumber) >= 4;

    if (!isLastQuestion) {
      const nextQNumber = Number(questionNumber) + 1;
      const existingNext = session.questions.find((q) => q.questionNumber === nextQNumber);
      if (!existingNext) {
        session.questions.push({
          questionNumber: nextQNumber,
          question: evaluation.nextQuestion,
        });
      }

      if (isMongo && typeof session.save === 'function') {
        await session.save();
      } else {
        memoryInterviews.set(sessionId, session);
      }

      return res.json({
        success: true,
        evaluation: {
          score: evaluation.score,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          suggestedAnswer: evaluation.suggestedAnswer,
        },
        isCompleted: false,
        nextQuestionNumber: nextQNumber,
        nextQuestion: evaluation.nextQuestion,
      });
    } else {
      session.status = 'completed';
      const answered = session.questions.filter((q) => q.score !== undefined);
      const avgScore = Math.round(
        answered.reduce((sum, q) => sum + (q.score || 0), 0) / (answered.length || 1)
      );
      session.overallScore = avgScore;
      session.strengths = [
        'Structured analytical problem breakdown',
        'Strong practical understanding of core principles',
      ];
      session.weakAreas = [
        'Could include more edge case analysis',
        'Discuss performance scaling trade-offs explicitly',
      ];
      session.improvementAdvice = [
        'Use the STAR method (Situation, Task, Action, Result) for all scenario questions',
        'Always quantify your achievements with measurable metrics',
      ];

      if (isMongo && typeof session.save === 'function') {
        await session.save();
        await Progress.findOneAndUpdate(
          { user: session.user },
          {
            $inc: { interviewsCompleted: 1 },
            $set: { averageInterviewScore: avgScore },
            $push: {
              milestones: {
                title: `Completed Mock Interview for ${session.role} (${avgScore}%)`,
                category: 'Mock Interview',
                date: new Date(),
              },
            },
          },
          { upsert: true }
        );
      } else {
        memoryInterviews.set(sessionId, session);
        const p = progressMap.get(String(session.user)) || { milestones: [] };
        p.interviewsCompleted = (p.interviewsCompleted || 0) + 1;
        p.averageInterviewScore = avgScore;
        p.milestones.push({
          title: `Completed Mock Interview for ${session.role} (${avgScore}%)`,
          category: 'Mock Interview',
          date: new Date(),
        });
        progressMap.set(String(session.user), p);
      }

      // Retain in Hindsight
      const interviewMemory = `Mock Interview Debrief: Candidate practiced for "${session.role}" (${session.experienceLevel}, ${session.interviewType}). Scored ${avgScore}%. Key strengths: ${session.strengths.join(
        ', '
      )}. Growth areas: ${session.weakAreas.join(', ')}. Actionable recommendation: ${session.improvementAdvice[0]}.`;

      const hindsightResult = await retainCareerMemory(session.user, interviewMemory, {
        tags: ['interview_feedback', 'mock_interview', 'communication'],
        context: 'AI Mock Interview Evaluation',
      });

      if (hindsightResult.success) {
        session.hindsightRetained = true;
        session.hindsightMemorySummary = interviewMemory;
        if (typeof session.save === 'function') await session.save();
      }

      return res.json({
        success: true,
        evaluation: {
          score: evaluation.score,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          suggestedAnswer: evaluation.suggestedAnswer,
        },
        isCompleted: true,
        summary: {
          overallScore: session.overallScore,
          strengths: session.strengths,
          weakAreas: session.weakAreas,
          improvementAdvice: session.improvementAdvice,
        },
        hindsight: hindsightResult,
      });
    }
  } catch (err) {
    console.error('[Interview Answer Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process interview answer',
      error: err.message,
    });
  }
}

/**
 * Get Interview History
 * GET /api/interview/history
 */
async function getInterviewHistory(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const isMongo = mongoose.connection.readyState === 1;
    let history = [];

    if (isMongo) {
      try {
        history = await InterviewSession.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
      } catch (e) {
        history = Array.from(memoryInterviews.values()).filter((i) => i.user === userId);
      }
    } else {
      history = Array.from(memoryInterviews.values()).filter((i) => i.user === userId);
    }

    return res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interview history',
      error: err.message,
    });
  }
}

module.exports = {
  startInterview,
  submitAnswer,
  getInterviewHistory,
};
