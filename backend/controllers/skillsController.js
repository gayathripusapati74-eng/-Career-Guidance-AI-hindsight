const mongoose = require('mongoose');
const SkillAssessment = require('../models/SkillAssessment');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { retainCareerMemory } = require('../services/hindsight');
const { assessments: memoryAssessments, users: memoryUsers, progressMap } = require('../utils/memoryDb');

/**
 * Submit Skill Assessment
 * POST /api/skills/assessment
 */
async function submitAssessment(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { skills, category = 'Comprehensive Technical Assessment' } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one skill assessment score',
      });
    }

    const totalScore = skills.reduce((sum, s) => sum + Number(s.score || 0), 0);
    const overallScore = Math.round(totalScore / skills.length);

    const strengths = skills
      .filter((s) => Number(s.score) >= 70)
      .map((s) => `${s.skill} (${s.score}%)`);

    const weakAreas = skills
      .filter((s) => Number(s.score) < 60)
      .map((s) => `${s.skill} (${s.score}%)`);

    const recommendations = [];
    if (weakAreas.length > 0) {
      recommendations.push(
        `Immediate Focus: Deep dive into ${weakAreas.slice(0, 2).join(' and ')} fundamentals before advanced frameworks.`
      );
    }
    if (strengths.length > 0) {
      recommendations.push(
        `Leverage your strength in ${strengths[0]} to build end-to-end full-stack portfolio demos.`
      );
    }
    recommendations.push(
      'Schedule dedicated 30-minute daily practice sessions focusing on code problem-solving.'
    );

    const assessmentData = {
      _id: `assess-${Date.now()}`,
      user: userId,
      category,
      skills: skills.map((s) => ({
        skill: s.skill,
        score: Number(s.score),
        maxScore: 100,
        level:
          s.level ||
          (s.score >= 80 ? 'advanced' : s.score >= 60 ? 'intermediate' : 'beginner'),
        details: s.details || [],
      })),
      overallScore,
      strengths,
      weakAreas,
      recommendations,
      createdAt: new Date(),
    };

    let assessment = null;
    const isMongo = mongoose.connection.readyState === 1;

    if (isMongo) {
      try {
        assessment = await SkillAssessment.create(assessmentData);
        const user = await User.findById(userId);
        if (user) {
          skills.forEach((newSkill) => {
            const idx = user.currentSkills.findIndex(
              (cs) => cs.name.toLowerCase() === newSkill.skill.toLowerCase()
            );
            const level =
              newSkill.level ||
              (newSkill.score >= 80 ? 'advanced' : newSkill.score >= 60 ? 'intermediate' : 'beginner');
            if (idx >= 0) {
              user.currentSkills[idx].score = newSkill.score;
              user.currentSkills[idx].level = level;
            } else {
              user.currentSkills.push({
                name: newSkill.skill,
                score: newSkill.score,
                level,
              });
            }
          });
          await user.save();
        }

        await Progress.findOneAndUpdate(
          { user: userId },
          {
            $inc: { skillAssessmentsCount: 1 },
            $set: { averageSkillScore: overallScore },
            $push: {
              milestones: {
                title: `Completed ${category} (${overallScore}%)`,
                category: 'Skill Assessment',
                date: new Date(),
              },
            },
          },
          { upsert: true }
        );
      } catch (e) {
        assessment = assessmentData;
        memoryAssessments.push(assessmentData);
      }
    } else {
      assessment = assessmentData;
      memoryAssessments.push(assessmentData);

      const memUser = memoryUsers.get(userId);
      if (memUser) {
        skills.forEach((newSkill) => {
          const idx = (memUser.currentSkills || []).findIndex(
            (cs) => cs.name.toLowerCase() === newSkill.skill.toLowerCase()
          );
          const level =
            newSkill.level ||
            (newSkill.score >= 80 ? 'advanced' : newSkill.score >= 60 ? 'intermediate' : 'beginner');
          if (idx >= 0) {
            memUser.currentSkills[idx].score = newSkill.score;
            memUser.currentSkills[idx].level = level;
          } else {
            memUser.currentSkills.push({
              name: newSkill.skill,
              score: newSkill.score,
              level,
            });
          }
        });
      }

      const p = progressMap.get(userId) || { milestones: [] };
      p.skillAssessmentsCount = (p.skillAssessmentsCount || 0) + 1;
      p.averageSkillScore = overallScore;
      p.milestones.push({
        title: `Completed ${category} (${overallScore}%)`,
        category: 'Skill Assessment',
        date: new Date(),
      });
      progressMap.set(userId, p);
    }

    // Retain in Hindsight
    const skillsBreakdown = skills.map((s) => `${s.skill}: ${s.score}%`).join(', ');
    const memoryText = `Skill Assessment Completed (${category}): Overall Score is ${overallScore}%. Breakdown: ${skillsBreakdown}. Strengths identified: ${
      strengths.join(', ') || 'Developing'
    }. Critical areas needing improvement: ${weakAreas.join(', ') || 'None (all proficient)'}. Target Career Goal: ${
      req.user?.careerGoal || 'Full Stack Developer'
    }.`;

    const hindsightResult = await retainCareerMemory(userId, memoryText, {
      tags: ['skill_assessment', 'scores', 'weak_areas', 'strengths'],
      context: 'Technical Assessment Scoring',
    });

    if (hindsightResult.success && assessment) {
      assessment.hindsightRetained = true;
      assessment.hindsightMemorySummary = memoryText;
      if (typeof assessment.save === 'function') await assessment.save();
    }

    return res.status(201).json({
      success: true,
      assessment,
      hindsight: hindsightResult,
    });
  } catch (err) {
    console.error('[Assessment Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process skill assessment',
      error: err.message,
    });
  }
}

/**
 * Get Skill Assessment History
 * GET /api/skills/history
 */
async function getAssessmentHistory(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    let history = [];

    if (mongoose.connection.readyState === 1) {
      try {
        history = await SkillAssessment.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
      } catch (e) {
        history = memoryAssessments.filter((a) => a.user === userId);
      }
    } else {
      history = memoryAssessments.filter((a) => a.user === userId);
    }

    return res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load assessment history',
      error: err.message,
    });
  }
}

module.exports = {
  submitAssessment,
  getAssessmentHistory,
};
