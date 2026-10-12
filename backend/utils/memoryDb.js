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

const { generateSyntheticStudents, generateSampleInterventions } = require('../services/campusiqSeed');

const students = new Map();
const interventions = new Map();
const dataImports = [];
let campusiqConfig = {
  weights: null, // will use DEFAULT_WEIGHTS
  thresholds: null, // will use DEFAULT_THRESHOLDS
};

// Seed 200 reproducible benchmark students & sample interventions
const seededStudents = generateSyntheticStudents(200);
for (const s of seededStudents) {
  students.set(s.studentId, s);
}

const seededInterventions = generateSampleInterventions(seededStudents);
for (const int of seededInterventions) {
  interventions.set(int.interventionId, int);
}

// Seed initial Data Hub import history records
dataImports.push(
  {
    importId: 'IMP-2026-001',
    datasetCategory: 'Student Master',
    fileName: 'students_master_2026.csv',
    fileSizeKB: 48,
    totalRows: 200,
    successfulRows: 200,
    rejectedRows: 0,
    duplicateRows: 0,
    rejectedDetails: [],
    status: 'Success',
    uploadedBy: 'Admin (System Seed)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    importId: 'IMP-2026-002',
    datasetCategory: 'Academic Records',
    fileName: 'midterm_semester_grades.csv',
    fileSizeKB: 62,
    totalRows: 200,
    successfulRows: 198,
    rejectedRows: 2,
    duplicateRows: 0,
    rejectedDetails: [
      { rowNumber: 142, studentId: 'STU2026-999', reason: 'Unmatched Student ID (Not found in Student Master)', dataSnippet: 'STU2026-999,CSE,8.2' },
      { rowNumber: 188, studentId: 'STU2026-088', reason: 'Invalid GPA value (12.5 exceeds 10.0 scale)', dataSnippet: 'STU2026-088,IT,12.5' },
    ],
    status: 'Partial',
    uploadedBy: 'Prof. Registrar Office',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
  },
  {
    importId: 'IMP-2026-003',
    datasetCategory: 'Attendance',
    fileName: 'biometric_monthly_attendance.csv',
    fileSizeKB: 34,
    totalRows: 200,
    successfulRows: 200,
    rejectedRows: 0,
    duplicateRows: 0,
    rejectedDetails: [],
    status: 'Success',
    uploadedBy: 'Biometric Attendance System',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  }
);

module.exports = {
  users,
  assessments,
  resumes,
  plans,
  messages,
  quizzes,
  interviews,
  progressMap,
  students,
  interventions,
  dataImports,
  campusiqConfig,
};
