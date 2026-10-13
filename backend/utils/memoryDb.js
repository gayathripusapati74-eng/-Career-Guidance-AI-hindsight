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

// Seed institutional role accounts & demo candidate user
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = async (pwd) => bcrypt.hash(pwd, salt);

  const makeUser = async (id, firstName, lastName, email, plainPassword, role, extra = {}) => {
    const hashedPassword = await hash(plainPassword);
    return {
      _id: id,
      id,
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      studentId: extra.studentId || null,
      department: extra.department || null,
      assignedMentor: extra.assignedMentor || null,
      careerGoal: extra.careerGoal || 'Full Stack Developer',
      targetRole: extra.targetRole || 'Full Stack Developer',
      experienceLevel: extra.experienceLevel || 'intermediate',
      currentSkills: extra.currentSkills || [
        { name: 'JavaScript', score: 75, level: 'intermediate' },
        { name: 'Python', score: 70, level: 'intermediate' },
      ],
      hindsightBankId: `career-bank-${id}`,
      comparePassword: async function (pass) {
        return bcrypt.compare(pass, this.password);
      },
    };
  };

  // 1. Institutional Admin Account
  const adminUser = await makeUser('user-admin-001', 'Institutional', 'Admin', 'admin@campus.edu.in', 'Admin@123', 'admin', {
    department: 'Central Administration',
    careerGoal: 'Education Administration',
  });
  users.set(adminUser.id, adminUser);

  // 2. Faculty / Mentor (CSE)
  const facultyCse = await makeUser('user-faculty-cse-001', 'Dr. S.', 'Sharma', 'faculty.cse@campus.edu.in', 'Faculty@123', 'faculty', {
    department: 'Computer Science & Engineering',
    assignedMentor: 'Dr. S. Sharma (Prof. CSE)',
  });
  users.set(facultyCse.id, facultyCse);

  // 3. Faculty / Mentor (IT)
  const facultyIt = await makeUser('user-faculty-it-001', 'Dr. V.', 'Nambiar', 'faculty.it@campus.edu.in', 'Faculty@123', 'faculty', {
    department: 'Information Technology',
    assignedMentor: 'Dr. V. Nambiar (Assoc. Prof. IT)',
  });
  users.set(facultyIt.id, facultyIt);

  // 4. Student 1: Aarav Sharma (STU2026-001)
  const student1 = await makeUser('user-student-001', 'Aarav', 'Sharma', 'student.aarav@campus.edu.in', 'Student@123', 'student', {
    studentId: 'STU2026-001',
    department: 'Computer Science & Engineering',
  });
  users.set(student1.id, student1);

  // 5. Student 2: Sneha Iyer (STU2026-004)
  const student2 = await makeUser('user-student-002', 'Sneha', 'Iyer', 'student.sneha@campus.edu.in', 'Student@123', 'student', {
    studentId: 'STU2026-004',
    department: 'Computer Science & Engineering',
  });
  users.set(student2.id, student2);

  // 6. Preserved Demo Candidate Account (Admin role by default for legacy tests)
  const demoCandidate = await makeUser('demo-candidate-id-001', 'Demo', 'Candidate', 'demo.candidate@example.com', 'Password123!', 'admin', {
    careerGoal: 'Full Stack Developer',
    targetRole: 'Full Stack Developer',
    currentSkills: [
      { name: 'JavaScript', score: 68, level: 'intermediate' },
      { name: 'React', score: 75, level: 'intermediate' },
      { name: 'SQL', score: 42, level: 'beginner' },
    ],
  });
  users.set(demoCandidate.id, demoCandidate);

  progressMap.set(demoCandidate.id, {
    user: demoCandidate.id,
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
