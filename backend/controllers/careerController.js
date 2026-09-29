const mongoose = require('mongoose');
const CareerPlan = require('../models/CareerPlan');
const SkillAssessment = require('../models/SkillAssessment');
const ResumeEvaluation = require('../models/ResumeEvaluation');
const Progress = require('../models/Progress');
const { generateCareerRoadmap } = require('../services/ai');
const { recallCareerMemory, retainCareerMemory } = require('../services/hindsight');
const { plans: memoryPlans, progressMap, assessments: memoryAssessments, resumes: memoryResumes } = require('../utils/memoryDb');

/**
 * Generate Personalized Roadmap
 * POST /api/career/roadmap
 */
async function generateRoadmap(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const user = req.user;
    const { goal } = req.body;
    const targetGoal = goal || user.careerGoal || 'Full Stack Developer';
    const isMongo = mongoose.connection.readyState === 1;

    // 1. Recall Hindsight Memories
    const memoryRecall = await recallCareerMemory(
      userId,
      `Career trajectory, goals, weak skills, and accomplishments for ${targetGoal}`
    );
    const memories = memoryRecall.success ? memoryRecall.memories : [];

    // 2. Gather latest resume & assessments
    let latestAssessment = null;
    let latestResume = null;

    if (isMongo) {
      try {
        [latestAssessment, latestResume] = await Promise.all([
          SkillAssessment.findOne({ user: userId }).sort({ createdAt: -1 }),
          ResumeEvaluation.findOne({ user: userId }).sort({ createdAt: -1 }),
        ]);
      } catch (e) {
        // fallback
      }
    }

    if (!latestAssessment) {
      latestAssessment = memoryAssessments.filter((a) => a.user === userId).slice(-1)[0] || null;
    }
    if (!latestResume) {
      latestResume = memoryResumes.filter((r) => r.user === userId).slice(-1)[0] || null;
    }

    // 3. Generate Roadmap with AI
    const roadmapData = await generateCareerRoadmap({
      goal: targetGoal,
      currentSkills: user.currentSkills || [],
      experienceLevel: user.experienceLevel || 'beginner',
      memories,
      resumeData: latestResume,
    });

    let plan = null;

    if (isMongo) {
      try {
        plan = await CareerPlan.findOne({ user: userId });
        if (!plan) {
          plan = new CareerPlan({
            user: userId,
            goal: targetGoal,
            targetRole: user.targetRole || targetGoal,
            currentLevel: user.experienceLevel || 'Beginner',
            estimatedDuration: roadmapData.estimatedDuration || '6 Months',
            phases: roadmapData.phases,
            overallProgress: 0,
            generatedFromMemories: memories.length > 0,
          });
        } else {
          plan.goal = targetGoal;
          plan.targetRole = user.targetRole || targetGoal;
          plan.phases = roadmapData.phases;
          plan.generatedFromMemories = memories.length > 0;
        }
        await plan.save();

        await Progress.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              totalRoadmapPhases: plan.phases.length,
              completedRoadmapPhases: plan.phases.filter((p) => p.status === 'completed').length,
            },
            $push: {
              milestones: {
                title: `Generated Customized Career Roadmap for ${targetGoal}`,
                category: 'Career Roadmap',
                date: new Date(),
              },
            },
          },
          { upsert: true }
        );
      } catch (e) {
        plan = null;
      }
    }

    if (!plan) {
      plan = {
        _id: `plan-${Date.now()}`,
        user: userId,
        goal: targetGoal,
        targetRole: user.targetRole || targetGoal,
        currentLevel: user.experienceLevel || 'Beginner',
        estimatedDuration: roadmapData.estimatedDuration || '6 Months',
        phases: roadmapData.phases,
        overallProgress: 0,
        generatedFromMemories: memories.length > 0,
      };
      memoryPlans.set(userId, plan);

      const p = progressMap.get(userId) || { milestones: [] };
      p.totalRoadmapPhases = plan.phases.length;
      p.completedRoadmapPhases = 0;
      p.milestones.push({
        title: `Generated Customized Career Roadmap for ${targetGoal}`,
        category: 'Career Roadmap',
        date: new Date(),
      });
      progressMap.set(userId, p);
    }

    // 4. Retain in Hindsight
    const planSummary = `Generated 6-Phase Personalized Career Roadmap for "${targetGoal}". Phase 1: ${plan.phases[0]?.title}. User starting with assessed skills: ${(user.currentSkills || []).map((s) => s.name).join(', ') || 'General fundamentals'}.`;
    retainCareerMemory(userId, planSummary, {
      tags: ['roadmap', 'career_plan', 'goals'],
      context: 'Roadmap Generation',
    }).catch((err) => console.warn('[Roadmap] Hindsight retain error:', err.message));

    return res.status(201).json({
      success: true,
      plan,
      memoriesRecalledCount: memories.length,
    });
  } catch (err) {
    console.error('[Roadmap Generation Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate career roadmap',
      error: err.message,
    });
  }
}

/**
 * Get Current Roadmap
 * GET /api/career/roadmap
 */
async function getRoadmap(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const isMongo = mongoose.connection.readyState === 1;
    let plan = null;

    if (isMongo) {
      try {
        plan = await CareerPlan.findOne({ user: userId });
      } catch (e) {
        plan = null;
      }
    }

    if (!plan) {
      plan = memoryPlans.get(userId);
    }

    if (!plan) {
      const roadmapData = await generateCareerRoadmap({
        goal: req.user.careerGoal || 'Full Stack Developer',
        currentSkills: req.user.currentSkills || [],
        experienceLevel: req.user.experienceLevel || 'beginner',
      });

      const newPlan = {
        _id: `plan-${Date.now()}`,
        user: userId,
        goal: req.user.careerGoal || 'Full Stack Developer',
        targetRole: req.user.targetRole || 'Full Stack Developer',
        currentLevel: req.user.experienceLevel || 'Beginner',
        estimatedDuration: roadmapData.estimatedDuration,
        phases: roadmapData.phases,
        overallProgress: 0,
      };

      if (isMongo) {
        try {
          plan = await CareerPlan.create(newPlan);
        } catch (e) {
          plan = newPlan;
          memoryPlans.set(userId, newPlan);
        }
      } else {
        plan = newPlan;
        memoryPlans.set(userId, newPlan);
      }
    }

    return res.json({
      success: true,
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roadmap',
      error: err.message,
    });
  }
}

/**
 * Update Phase Status
 * PUT /api/career/roadmap/phase
 */
async function updatePhaseStatus(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { phaseNumber, status } = req.body;

    if (!phaseNumber || !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid phaseNumber and status (pending, in_progress, completed) are required',
      });
    }

    const isMongo = mongoose.connection.readyState === 1;
    let plan = null;

    if (isMongo) {
      try {
        plan = await CareerPlan.findOne({ user: userId });
      } catch (e) {
        plan = null;
      }
    }

    if (!plan) {
      plan = memoryPlans.get(userId);
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Career plan not found' });
    }

    const phase = plan.phases.find((p) => p.phaseNumber === Number(phaseNumber));
    if (!phase) {
      return res.status(404).json({ success: false, message: `Phase ${phaseNumber} not found` });
    }

    phase.status = status;

    const completedCount = plan.phases.filter((p) => p.status === 'completed').length;
    plan.overallProgress = Math.round((completedCount / plan.phases.length) * 100);

    if (isMongo && typeof plan.save === 'function') {
      await plan.save();
      await Progress.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            completedRoadmapPhases: completedCount,
            totalRoadmapPhases: plan.phases.length,
          },
        }
      );
    } else {
      memoryPlans.set(userId, plan);
      const p = progressMap.get(userId) || {};
      p.completedRoadmapPhases = completedCount;
      p.totalRoadmapPhases = plan.phases.length;
      progressMap.set(userId, p);
    }

    // Retain milestone in Hindsight if completed
    if (status === 'completed') {
      const milestoneNote = `Roadmap Milestone Achieved: User successfully completed Phase ${phase.phaseNumber} - "${phase.title}". Overall roadmap progress is now ${plan.overallProgress}%.`;
      retainCareerMemory(userId, milestoneNote, {
        tags: ['roadmap_milestone', 'progress', 'achievement'],
        context: 'Roadmap Phase Completion',
      }).catch((err) => console.warn('[Roadmap Phase] Hindsight retain error:', err.message));
    }

    return res.json({
      success: true,
      message: `Phase ${phaseNumber} updated to ${status}`,
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update phase',
      error: err.message,
    });
  }
}

module.exports = {
  generateRoadmap,
  getRoadmap,
  updatePhaseStatus,
};
