const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication Engineering',
        'Mechanical Engineering',
      ],
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      default: 'A',
    },
    assignedMentor: {
      type: String,
      default: 'Dr. S. Sharma',
    },

    // 1. Academic Performance
    academic: {
      gpa: { type: Number, min: 0, max: 10, default: null }, // 10-point scale
      cgpa: { type: Number, min: 0, max: 10, default: null },
      attendancePercentage: { type: Number, min: 0, max: 100, default: null },
      backlogs: { type: Number, default: 0 },
      assignmentCompletion: { type: Number, min: 0, max: 100, default: null },
      marksHistory: [
        {
          semester: Number,
          exam: String, // Midterm 1, Midterm 2, End-Sem
          percentage: Number,
          date: Date,
        },
      ],
      subjectScores: [
        {
          subject: String,
          score: Number,
          passingThreshold: { type: Number, default: 40 },
          hasBacklog: { type: Boolean, default: false },
        },
      ],
    },

    // 2. LMS Activity
    lms: {
      loginFrequencyPerWeek: { type: Number, default: null },
      videoCompletionRate: { type: Number, min: 0, max: 100, default: null },
      forumPosts: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
      timeSpentHoursWeekly: { type: Number, default: null },
      assignmentSubmissionOnTimeRate: { type: Number, min: 0, max: 100, default: null },
    },

    // 3. Placement Readiness
    placement: {
      codingScore: { type: Number, min: 0, max: 100, default: null },
      aptitudeScore: { type: Number, min: 0, max: 100, default: null },
      mockInterviewScore: { type: Number, min: 0, max: 100, default: null },
      milestonesCompleted: { type: Number, default: 0 },
      totalMilestones: { type: Number, default: 5 },
      resumeReviewed: { type: Boolean, default: false },
      readinessCategory: {
        type: String,
        enum: ['High Ready', 'Moderate', 'At-Risk', 'Not Assessed'],
        default: 'Not Assessed',
      },
    },

    // 4. Skills Assessments
    skills: {
      technical: [
        {
          name: String,
          score: Number, // 0 - 100
          assessedDate: Date,
        },
      ],
      soft: [
        {
          name: String, // Communication, Teamwork, Problem Solving
          score: Number, // 0 - 100
          assessedDate: Date,
        },
      ],
      averageTechnical: { type: Number, default: null },
      averageSoft: { type: Number, default: null },
    },

    // 5. Extracurricular & Engagement
    engagement: {
      clubParticipationLevel: { type: String, enum: ['Active', 'Moderate', 'Low', 'None'], default: 'Moderate' },
      eventsAttendedCount: { type: Number, default: 0 },
      certificationsCount: { type: Number, default: 0 },
      score: { type: Number, min: 0, max: 100, default: null },
    },

    // 6. Student Feedback & Sentiment
    feedback: {
      academicSentiment: { type: String, enum: ['Positive', 'Neutral', 'Stressed', 'Dissatisfied'], default: 'Neutral' },
      mentorRating: { type: Number, min: 1, max: 5, default: 4 },
      lastSurveyDate: { type: Date, default: null },
    },

    // Computed Analytics & Risk Engines
    computed: {
      successScore: { type: Number, default: null }, // 0 to 100
      isProvisional: { type: Boolean, default: false },
      dataCoverage: { type: Number, default: 100 }, // percentage of eligible indicators present
      missingIndicators: [String],
      scoreBreakdown: {
        academic: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
        attendance: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
        lms: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
        placement: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
        skills: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
        engagement: { value: Number, normalized: Number, weight: Number, contribution: Number, coverage: Boolean },
      },
      academicRisk: {
        level: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
        score: { type: Number, default: 0 },
        reasons: [String],
        evidenceDates: [String],
        trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
      },
      placementRisk: {
        level: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
        score: { type: Number, default: 0 },
        reasons: [String],
        evidenceDates: [String],
        trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
      },
      segment: {
        type: String,
        enum: ['High Performers', 'Placement Focus', 'Academic Support', 'Intensive Support'],
        default: 'High Performers',
        index: true,
      },
      urgencyScore: { type: Number, default: 0 }, // priority queue ranking metric
      reviewStatus: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Dismissed'],
        default: 'Pending',
      },
      lastReviewedAt: { type: Date, default: null },
      reviewedBy: { type: String, default: null },
      reviewNotes: { type: String, default: '' },
    },

    // Source Tracking & Metadata
    metadata: {
      dataFreshness: { type: Date, default: Date.now },
      sources: {
        academic: { type: String, default: 'University Registrar ERP' },
        attendance: { type: String, default: 'Biometric Attendance System' },
        lms: { type: String, default: 'Moodle LMS' },
        placement: { type: String, default: 'Campus Placement Portal' },
        skills: { type: String, default: 'Skill Benchmark Assessment' },
      },
      isSyntheticDemo: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
