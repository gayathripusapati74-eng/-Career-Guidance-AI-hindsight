const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const ResumeEvaluation = require('../models/ResumeEvaluation');
const Progress = require('../models/Progress');
const { evaluateResumeText } = require('../services/ai');
const { retainCareerMemory } = require('../services/hindsight');
const { resumes: memoryResumes, progressMap } = require('../utils/memoryDb');

/**
 * Evaluate Resume
 * POST /api/resume/evaluate
 */
async function evaluateResume(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    let resumeText = '';
    let fileName = 'Pasted-Resume.txt';

    if (req.file) {
      fileName = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(req.file.buffer);
        resumeText = parsed.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      fileName = req.body.fileName || 'Pasted-Resume.txt';
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid resume content (at least 20 characters) or upload a resume file (PDF or TXT)',
      });
    }

    const careerGoal = req.user.careerGoal || 'Full Stack Developer';

    // AI analysis
    const evaluation = await evaluateResumeText({
      resumeText,
      careerGoal,
    });

    const resumeData = {
      _id: `resume-${Date.now()}`,
      user: userId,
      fileName,
      atsScore: evaluation.atsScore,
      detectedRole: evaluation.detectedRole || careerGoal,
      detectedSkills: evaluation.detectedSkills || [],
      missingSkills: evaluation.missingSkills || [],
      experienceSummary: evaluation.experienceSummary || '',
      education: evaluation.education || [],
      projects: evaluation.projects || [],
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      atsFeedback: evaluation.atsFeedback || [],
      createdAt: new Date(),
    };

    let resumeRecord = null;
    const isMongo = mongoose.connection.readyState === 1;

    if (isMongo) {
      try {
        resumeRecord = await ResumeEvaluation.create(resumeData);
        await Progress.findOneAndUpdate(
          { user: userId },
          {
            $set: { resumeScore: evaluation.atsScore },
            $push: {
              milestones: {
                title: `Resume Evaluated: ATS Score ${evaluation.atsScore}%`,
                category: 'Resume',
                date: new Date(),
              },
            },
          },
          { upsert: true }
        );
      } catch (e) {
        resumeRecord = resumeData;
        memoryResumes.push(resumeData);
      }
    } else {
      resumeRecord = resumeData;
      memoryResumes.push(resumeData);

      const p = progressMap.get(userId) || { milestones: [] };
      p.resumeScore = evaluation.atsScore;
      p.milestones.push({
        title: `Resume Evaluated: ATS Score ${evaluation.atsScore}%`,
        category: 'Resume',
        date: new Date(),
      });
      progressMap.set(userId, p);
    }

    // Retain useful career insights in Hindsight (NO personal contact info)
    const memoryInsight = `Resume Evaluation Insight: Target Role "${careerGoal}". ATS Match Score: ${
      evaluation.atsScore
    }/100. Verified Skills: ${evaluation.detectedSkills.slice(0, 8).join(', ')}. Missing Gaps to Acquire: ${
      evaluation.missingSkills.slice(0, 5).join(', ')
    }. Key Improvement: ${evaluation.improvements[0] || 'Quantify project achievements with metrics'}.`;

    const hindsightResult = await retainCareerMemory(userId, memoryInsight, {
      tags: ['resume_evaluation', 'ats_score', 'skills_gap'],
      context: 'Resume Technical Profiling',
    });

    if (hindsightResult.success && resumeRecord) {
      resumeRecord.hindsightRetained = true;
      resumeRecord.hindsightMemorySummary = memoryInsight;
      if (typeof resumeRecord.save === 'function') await resumeRecord.save();
    }

    return res.status(201).json({
      success: true,
      evaluation: resumeRecord,
      hindsight: hindsightResult,
    });
  } catch (err) {
    console.error('[Resume Evaluation Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate resume',
      error: err.message,
    });
  }
}

/**
 * Get Latest Resume Evaluation
 * GET /api/resume/latest
 */
async function getLatestEvaluation(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    let latest = null;

    if (mongoose.connection.readyState === 1) {
      try {
        latest = await ResumeEvaluation.findOne({ user: userId }).sort({ createdAt: -1 });
      } catch (e) {
        latest = memoryResumes.filter((r) => r.user === userId).slice(-1)[0] || null;
      }
    } else {
      latest = memoryResumes.filter((r) => r.user === userId).slice(-1)[0] || null;
    }

    return res.json({
      success: true,
      evaluation: latest,
      message: latest ? 'Latest evaluation found' : 'No resume evaluated yet',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch resume evaluation',
      error: err.message,
    });
  }
}

module.exports = {
  evaluateResume,
  getLatestEvaluation,
};
