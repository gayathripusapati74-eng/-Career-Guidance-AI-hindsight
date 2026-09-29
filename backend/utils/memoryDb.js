/**
 * In-Memory Database Fallback Store
 * Used automatically when MongoDB connection is not established
 * Allows instant local hackathon demonstration and testing
 */

const bcrypt = require('bcryptjs');

const users = new Map();
const assessments = [];
const resumes = [];
const plans = new Map();
const messages = [];
const quizzes = [];
const interviews = new Map();
const progressMap = new Map();

// Seed a default demo candidate user
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);
  const demoId = 'demo-candidate-id-001';

  users.set(demoId, {
    _id: demoId,
    id: demoId,
    firstName: 'Demo',
    lastName: 'Candidate',
    email: 'demo.candidate@example.com',
    password: hashedPassword,
    careerGoal: 'Full Stack Developer',
    targetRole: 'Full Stack Developer',
    experienceLevel: 'beginner',
    currentSkills: [
      { name: 'JavaScript', score: 68, level: 'intermediate' },
      { name: 'React', score: 75, level: 'intermediate' },
      { name: 'SQL', score: 42, level: 'beginner' },
    ],
    hindsightBankId: 'career-bank-demo-candidate',
    comparePassword: async function (pass) {
      return bcrypt.compare(pass, this.password);
    },
  });

  progressMap.set(demoId, {
    user: demoId,
    skillAssessmentsCount: 1,
    quizzesTaken: 1,
    interviewsCompleted: 0,
    averageSkillScore: 68,
    averageQuizScore: 80,
    averageInterviewScore: 0,
    resumeScore: 78,
    completedRoadmapPhases: 1,
    totalRoadmapPhases: 6,
    milestones: [
      { title: 'Initialized Demo Candidate Profile', category: 'Account', date: new Date() },
    ],
    hindsightReflections: [],
  });
})();

module.exports = {
  users,
  assessments,
  resumes,
  plans,
  messages,
  quizzes,
  interviews,
  progressMap,
};
