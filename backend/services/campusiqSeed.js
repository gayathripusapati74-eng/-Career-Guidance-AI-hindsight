/**
 * CampusIQ Synthetic Data Generator
 * Generates a reproducible, high-fidelity 200-student benchmark dataset
 * using a deterministic Linear Congruential Generator (LCG) with fixed seed = 42.
 */

const { processStudentRecord } = require('./campusiqScoring');

// Deterministic PRNG with fixed seed for 100% reproducible benchmark testing
class DeterministicRNG {
  constructor(seed = 42) {
    this.m = 0x80000000; // 2**31
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  nextFloat() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  nextInt(min, max) {
    return Math.floor(min + this.nextFloat() * (max - min + 1));
  }

  choice(arr) {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Pooja', 'Vikram', 'Divya',
  'Kavya', 'Rahul', 'Ishaan', 'Meera', 'Arjun', 'Tanvi', 'Siddharth', 'Riya',
  'Nikhil', 'Priyanka', 'Varun', 'Neha', 'Gautam', 'Shreya', 'Amit', 'Swati',
  'Karthik', 'Gayathri', 'Harsh', 'Anushka', 'Pranav', 'Deepika', 'Manish', 'Bhavna',
  'Yash', 'Shruti', 'Akash', 'Simran', 'Kunal', 'Rashmi', 'Vivek', 'Monika'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Reddy', 'Singh', 'Nair', 'Kulkarni',
  'Rao', 'Choudhury', 'Joshi', 'Menon', 'Bose', 'Gupta', 'Deshmukh', 'Mishra',
  'Bhat', 'Chatterjee', 'Pillai', 'Pandey', 'Saxena', 'Kapoor', 'Mehta', 'Das'
];

const MENTORS = [
  'Dr. S. Sharma (Prof. CSE)',
  'Dr. V. Nambiar (Assoc. Prof. IT)',
  'Dr. P. Deshmukh (Prof. ECE)',
  'Dr. K. Raman (Prof. MECH)',
  'Dr. Meenakshi Sundaram (Dean of Academics)',
];

/**
 * Generate 200 synthetic students with realistic variation
 */
function generateSyntheticStudents(count = 200) {
  const rng = new DeterministicRNG(42);
  const students = [];

  for (let i = 1; i <= count; i++) {
    const studentId = `STU2026-${String(i).padStart(3, '0')}`;
    const firstName = rng.choice(FIRST_NAMES);
    const lastName = rng.choice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@campus.edu.in`;
    const department = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
    const year = ((i - 1) % 4) + 1; // 1, 2, 3, 4
    const semester = year * 2 - (rng.nextFloat() > 0.5 ? 0 : 1);
    const section = rng.choice(['A', 'B', 'C']);
    const assignedMentor = rng.choice(MENTORS);

    // Create 4 distinct target archetype clusters:
    // 0: High Performer (~25%)
    // 1: Placement Focus (~25%)
    // 2: Academic Support (~25%)
    // 3: Intensive Support (~25%)
    const archetype = i % 4;

    let gpa, backlogs, attendance, codingScore, aptitudeScore, mockInterview;
    let videoCompletion, loginFreq, timeSpent;

    if (archetype === 0) {
      // High Performer
      gpa = Math.round((8.2 + rng.nextFloat() * 1.6) * 10) / 10; // 8.2 - 9.8
      backlogs = 0;
      attendance = rng.nextInt(85, 98);
      codingScore = rng.nextInt(75, 96);
      aptitudeScore = rng.nextInt(78, 95);
      mockInterview = rng.nextInt(75, 92);
      videoCompletion = rng.nextInt(80, 100);
      loginFreq = rng.nextInt(4, 7);
      timeSpent = rng.nextInt(8, 16);
    } else if (archetype === 1) {
      // Placement Focus: Good Academics, but weak coding/aptitude
      gpa = Math.round((7.2 + rng.nextFloat() * 1.5) * 10) / 10; // 7.2 - 8.7
      backlogs = 0;
      attendance = rng.nextInt(80, 94);
      codingScore = rng.nextInt(28, 48); // Below corporate benchmark
      aptitudeScore = rng.nextInt(38, 52);
      mockInterview = rng.nextInt(40, 58);
      videoCompletion = rng.nextInt(70, 95);
      loginFreq = rng.nextInt(3, 5);
      timeSpent = rng.nextInt(6, 12);
    } else if (archetype === 2) {
      // Academic Support: Brilliant practical coders, but low GPA / attendance
      gpa = Math.round((5.2 + rng.nextFloat() * 1.4) * 10) / 10; // 5.2 - 6.6
      backlogs = rng.nextInt(1, 2);
      attendance = rng.nextInt(62, 74); // Attendance warning
      codingScore = rng.nextInt(76, 95); // High coding talent
      aptitudeScore = rng.nextInt(70, 88);
      mockInterview = rng.nextInt(68, 85);
      videoCompletion = rng.nextInt(45, 68);
      loginFreq = rng.nextInt(2, 4);
      timeSpent = rng.nextInt(4, 9);
    } else {
      // Intensive Support: Struggles across both dimensions
      gpa = Math.round((4.6 + rng.nextFloat() * 1.4) * 10) / 10; // 4.6 - 6.0
      backlogs = rng.nextInt(1, 3);
      attendance = rng.nextInt(52, 66); // Critical attendance deficit
      codingScore = rng.nextInt(22, 44);
      aptitudeScore = rng.nextInt(30, 48);
      mockInterview = rng.nextInt(32, 50);
      videoCompletion = rng.nextInt(30, 55);
      loginFreq = rng.nextInt(1, 3);
      timeSpent = rng.nextInt(2, 6);
    }

    // Realistic missing data injection (~15% of records have one missing dimension)
    // To demonstrate provisional score calculation and data coverage transparency
    const hasMissingPlacement = (i % 7 === 0 && year <= 2); // 1st/2nd years might not have placement yet
    const hasMissingLms = (i % 11 === 0);
    const hasMissingEngagement = (i % 13 === 0);

    // Subject Scores
    const subjectNames = department.includes('Computer') || department.includes('Information')
      ? ['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks']
      : department.includes('Electronics')
      ? ['Digital Signal Processing', 'Microprocessors', 'Signals & Systems', 'VLSI Design']
      : ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing Tech'];

    const subjectScores = subjectNames.map((s, idx) => {
      const baseSubScore = Math.max(25, Math.min(98, Math.round(gpa * 9.5 + rng.nextInt(-14, 12))));
      const hasBacklog = baseSubScore < 40 && backlogs > 0;
      return {
        subject: s,
        score: baseSubScore,
        passingThreshold: 40,
        hasBacklog,
      };
    });

    // Marks History (trend analysis)
    const marksHistory = [
      {
        semester: Math.max(1, semester - 1),
        exam: 'Previous End-Sem',
        percentage: Math.round(gpa * 9.2 + rng.nextInt(-6, 6)),
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      },
      {
        semester: semester,
        exam: 'Current Midterm Exam',
        percentage: Math.round(
          archetype === 3 || archetype === 2
            ? gpa * 9.0 - rng.nextInt(6, 16) // Declining trend for at-risk
            : gpa * 9.5 + rng.nextInt(-2, 8)
        ),
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
      },
    ];

    const studentRaw = {
      studentId,
      name,
      email,
      department,
      year,
      semester,
      section,
      assignedMentor,
      academic: {
        gpa,
        cgpa: gpa,
        attendancePercentage: attendance,
        backlogs,
        assignmentCompletion: rng.nextInt(55, 98),
        marksHistory,
        subjectScores,
      },
      lms: hasMissingLms ? {
        loginFrequencyPerWeek: null,
        videoCompletionRate: null,
        forumPosts: 0,
        lastActiveDate: null,
        timeSpentHoursWeekly: null,
        assignmentSubmissionOnTimeRate: null,
      } : {
        loginFrequencyPerWeek: loginFreq,
        videoCompletionRate: videoCompletion,
        forumPosts: rng.nextInt(0, 12),
        lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (archetype === 3 ? rng.nextInt(15, 32) : rng.nextInt(1, 6))),
        timeSpentHoursWeekly: timeSpent,
        assignmentSubmissionOnTimeRate: rng.nextInt(50, 95),
      },
      placement: hasMissingPlacement ? {
        codingScore: null,
        aptitudeScore: null,
        mockInterviewScore: null,
        milestonesCompleted: 0,
        totalMilestones: 5,
        resumeReviewed: false,
        readinessCategory: 'Not Assessed',
      } : {
        codingScore,
        aptitudeScore,
        mockInterviewScore: mockInterview,
        milestonesCompleted: archetype === 0 ? 5 : archetype === 1 ? 2 : archetype === 2 ? 3 : 1,
        totalMilestones: 5,
        resumeReviewed: archetype === 0 || archetype === 2,
        readinessCategory: archetype === 0 ? 'High Ready' : archetype === 2 ? 'Moderate' : 'At-Risk',
      },
      skills: {
        technical: [
          { name: 'Algorithmic Problem Solving', score: codingScore || 50, assessedDate: new Date() },
          { name: 'System / Technical Architecture', score: rng.nextInt(40, 90), assessedDate: new Date() },
          { name: 'Domain Tools & Frameworks', score: rng.nextInt(45, 92), assessedDate: new Date() },
        ],
        soft: [
          { name: 'Technical Communication', score: mockInterview || rng.nextInt(45, 85), assessedDate: new Date() },
          { name: 'Analytical Reasoning', score: aptitudeScore || rng.nextInt(45, 85), assessedDate: new Date() },
        ],
        averageTechnical: codingScore || 50,
        averageSoft: mockInterview || 60,
      },
      engagement: hasMissingEngagement ? {
        clubParticipationLevel: 'None',
        eventsAttendedCount: 0,
        certificationsCount: 0,
        score: null,
      } : {
        clubParticipationLevel: archetype === 0 ? 'Active' : archetype === 3 ? 'Low' : 'Moderate',
        eventsAttendedCount: rng.nextInt(0, 5),
        certificationsCount: archetype === 0 ? rng.nextInt(1, 4) : 0,
        score: rng.nextInt(35, 95),
      },
      feedback: {
        academicSentiment: archetype === 3 ? 'Stressed' : archetype === 0 ? 'Positive' : 'Neutral',
        mentorRating: archetype === 0 ? 5 : archetype === 3 ? 2 : 4,
        lastSurveyDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      metadata: {
        dataFreshness: new Date(),
        sources: {
          academic: 'University Registrar ERP',
          attendance: 'Biometric Attendance System',
          lms: 'Moodle LMS',
          placement: 'Campus Placement Portal',
          skills: 'Skill Benchmark Assessment',
        },
        isSyntheticDemo: true,
      },
    };

    // Run scoring & dual-risk engine on student
    const processed = processStudentRecord(studentRaw);
    studentRaw.computed = processed;

    students.push(studentRaw);
  }

  return students;
}

/**
 * Generate sample seeded interventions for Action Intelligence demonstration
 */
function generateSampleInterventions(students) {
  const atRiskStudents = students.filter(
    (s) => s.computed.academicRisk.level === 'Critical' || s.computed.placementRisk.level === 'Critical' || s.computed.academicRisk.level === 'High'
  );

  const sampleInterventions = [
    {
      interventionId: 'INT-2026-001',
      studentId: atRiskStudents[0]?.studentId || 'STU2026-004',
      studentName: atRiskStudents[0]?.name || 'Sneha Iyer',
      department: atRiskStudents[0]?.department || 'Computer Science & Engineering',
      year: atRiskStudents[0]?.year || 3,
      concernType: 'attendance',
      concernTitle: 'Critical Attendance Deficit (58%) & Subject Risk',
      concernDescription: 'Student has dropped below mandatory 65% attendance cutoff in Data Structures and Operating Systems with two missed laboratory practicals.',
      evidence: [
        { indicator: 'Biometric Attendance', value: '58%', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), threshold: '75%' },
        { indicator: 'Lab Attendance', value: '50%', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), threshold: '80%' },
      ],
      recommendedAction: 'Attendance Counselling & Parent-Faculty Conference',
      actionCategory: 'Attendance Counselling',
      priority: 'Critical',
      mentorAssigned: 'Dr. S. Sharma (Prof. CSE)',
      dateAssigned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      followUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: 'In-Progress',
      notes: [
        { author: 'Dr. S. Sharma', note: 'Met with student. Discovered personal transit challenges. Approved local hostel transfer and recovery lecture plan.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
      ],
      baselineIndicators: { gpa: 5.4, attendance: 58, codingScore: 35, aptitudeScore: 42, successScore: 46.2 },
      followUpIndicators: { gpa: 5.4, attendance: 66, codingScore: 38, aptitudeScore: 42, successScore: 51.0 },
      observedChanges: { attendanceDelta: +8, academicDelta: 0, codingDelta: +3, successScoreDelta: +4.8, qualitativeSummary: 'Attendance recovered by +8% over 12 days following mentor check-in' },
      outcomeReview: { effective: true, summary: 'Immediate positive response in attendance after transit barrier resolved.', reviewedBy: 'Dr. S. Sharma', reviewedAt: new Date() },
    },
    {
      interventionId: 'INT-2026-002',
      studentId: atRiskStudents[1]?.studentId || 'STU2026-008',
      studentName: atRiskStudents[1]?.name || 'Rohan Verma',
      department: atRiskStudents[1]?.department || 'Information Technology',
      year: atRiskStudents[1]?.year || 4,
      concernType: 'placement',
      concernTitle: 'Placement Coding Benchmark Deficit (32/100)',
      concernDescription: 'Student is in 7th semester placement season with high GPA (8.1) but failed first-round technical coding assessments due to weak time complexity optimization.',
      evidence: [
        { indicator: 'Campus Coding Round 1', value: '32/100', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), threshold: '60/100' },
        { indicator: 'LeetCode / Hackerrank Benchmark', value: '18/50 Solved', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18), threshold: '35/50' },
      ],
      recommendedAction: 'Intensive 4-Week Coding Accelerator & Peer Mentorship',
      actionCategory: 'Coding Practice Plan',
      priority: 'High',
      mentorAssigned: 'Dr. V. Nambiar (Assoc. Prof. IT)',
      dateAssigned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      followUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      status: 'In-Progress',
      notes: [
        { author: 'Dr. V. Nambiar', note: 'Enrolled in Saturday competitive programming workshop and assigned peer mentor (Aarav Sharma).', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) },
      ],
      baselineIndicators: { gpa: 8.1, attendance: 88, codingScore: 32, aptitudeScore: 78, successScore: 68.4 },
      followUpIndicators: { gpa: 8.1, attendance: 90, codingScore: 58, aptitudeScore: 80, successScore: 74.2 },
      observedChanges: { attendanceDelta: +2, academicDelta: 0, codingDelta: +26, successScoreDelta: +5.8, qualitativeSummary: 'Coding score increased from 32 to 58 in Mock Assessment 2' },
      outcomeReview: { effective: true, summary: 'Significant leap in data structure problem solving speed.', reviewedBy: 'Dr. V. Nambiar', reviewedAt: new Date() },
    },
    {
      interventionId: 'INT-2026-003',
      studentId: atRiskStudents[2]?.studentId || 'STU2026-012',
      studentName: atRiskStudents[2]?.name || 'Kavya Nair',
      department: atRiskStudents[2]?.department || 'Electronics & Communication Engineering',
      year: atRiskStudents[2]?.year || 2,
      concernType: 'academic',
      concernTitle: 'Signals & Systems Midterm Failure & LMS Inactivity',
      concernDescription: 'Scored 28/100 on Signals midterm exam and has not logged into LMS lecture portal for 22 consecutive days.',
      evidence: [
        { indicator: 'Midterm Exam Score', value: '28%', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), threshold: '40%' },
        { indicator: 'LMS Inactivity', value: '22 Days', dateObserved: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), threshold: '14 Days' },
      ],
      recommendedAction: 'Departmental Faculty Remedial Tutoring Program',
      actionCategory: 'Subject-Specific Support',
      priority: 'Medium',
      mentorAssigned: 'Dr. P. Deshmukh (Prof. ECE)',
      dateAssigned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      followUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      status: 'Completed',
      notes: [
        { author: 'Dr. P. Deshmukh', note: 'Completed 6 remedial tutoring hours. Student passed make-up assessment with 62%.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
      ],
      baselineIndicators: { gpa: 5.8, attendance: 71, codingScore: 48, aptitudeScore: 54, successScore: 54.0 },
      followUpIndicators: { gpa: 6.4, attendance: 78, codingScore: 50, aptitudeScore: 56, successScore: 61.5 },
      observedChanges: { attendanceDelta: +7, academicDelta: +0.6, codingDelta: +2, successScoreDelta: +7.5, qualitativeSummary: 'Cleared remedial exam with 62%; attendance improved to 78%' },
      outcomeReview: { effective: true, summary: 'Remedial tutoring successfully averted a backlog.', reviewedBy: 'Dr. P. Deshmukh', reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    },
  ];

  return sampleInterventions;
}

module.exports = {
  generateSyntheticStudents,
  generateSampleInterventions,
};
