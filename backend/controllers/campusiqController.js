/**
 * CampusIQ Controller
 * Handles CampusIQ analytics, student directory, early-warning radar,
 * dynamic segmentation, What-If simulation, Action Intelligence interventions,
 * and Data Integration Hub.
 */

const mongoose = require('mongoose');
const Student = require('../models/Student');
const Intervention = require('../models/Intervention');
const DataImport = require('../models/DataImport');
const {
  students: memoryStudents,
  interventions: memoryInterventions,
  dataImports: memoryDataImports,
  campusiqConfig,
} = require('../utils/memoryDb');
const {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  processStudentRecord,
  calculateStudentSuccessScore,
  evaluateDualRisk,
  determineStudentSegment,
} = require('../services/campusiqScoring');
const { generateSyntheticStudents, generateSampleInterventions } = require('../services/campusiqSeed');

// Helper to determine if MongoDB is active or using memory fallback
function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

const DEPT_MAP = {
  CSE: 'Computer Science & Engineering',
  IT: 'Information Technology',
  ECE: 'Electronics & Communication',
  MECH: 'Mechanical Engineering',
};

function normalizeDept(dept) {
  if (!dept || dept === 'All') return null;
  return DEPT_MAP[dept.toUpperCase()] || dept;
}

// Helper to get all students from active storage
async function getAllStudents(filter = {}) {
  let targetDept = normalizeDept(filter.department);
  if (isMongoActive()) {
    const mongoFilter = { ...filter };
    if (targetDept) mongoFilter.department = targetDept;
    return await Student.find(mongoFilter).lean();
  }
  let list = Array.from(memoryStudents.values());
  if (targetDept) {
    list = list.filter((s) => s.department === targetDept || s.department.toLowerCase().includes(targetDept.toLowerCase()));
  }
  if (filter.year) {
    list = list.filter((s) => s.year === Number(filter.year));
  }
  return list;
}

/**
 * 1. GET /api/campusiq/analytics
 * Comprehensive campus-wide analytics and calculated KPIs
 */
async function getAnalyticsOverview(req, res) {
  try {
    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Students cannot access institution-wide executive analytics.',
      });
    }

    const { department, year } = req.query;
    const filter = {};
    if (department && department !== 'All') filter.department = department;
    if (year && year !== 'All') filter.year = Number(year);

    // If faculty, default to faculty's department if no department specified
    if (req.user && req.user.role === 'faculty' && !filter.department && req.user.department) {
      filter.department = req.user.department;
    }

    const students = await getAllStudents(filter);
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.json({
        success: true,
        summary: {
          totalStudents: 0,
          averageSuccessScore: 0,
          academicRiskCount: 0,
          placementRiskCount: 0,
          criticalAlertsCount: 0,
          averageAttendance: 0,
          averageGpa: 0,
          averageCoding: 0,
          dataCompletenessRate: 100,
        },
        distributions: {},
      });
    }

    // Calculated KPI metrics
    let totalScore = 0;
    let totalAttendance = 0;
    let totalGpa = 0;
    let totalCoding = 0;
    let codingCount = 0;
    let gpaCount = 0;
    let attendanceCount = 0;
    let academicRiskCount = 0;
    let placementRiskCount = 0;
    let criticalCount = 0;
    let totalCoverageSum = 0;

    // Distributions
    const scoreBuckets = { '0-40 (Critical)': 0, '41-60 (Low)': 0, '61-75 (Moderate)': 0, '76-85 (Good)': 0, '86-100 (High)': 0 };
    const academicRiskDist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const placementRiskDist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const segmentDist = { 'High Performers': 0, 'Placement Focus': 0, 'Academic Support': 0, 'Intensive Support': 0 };

    const departmentMap = {};

    for (const s of students) {
      const score = s.computed?.successScore ?? 50;
      totalScore += score;

      if (score <= 40) scoreBuckets['0-40 (Critical)']++;
      else if (score <= 60) scoreBuckets['0-41-60 (Low)' || '41-60 (Low)']++;
      else if (score <= 75) scoreBuckets['61-75 (Moderate)']++;
      else if (score <= 85) scoreBuckets['76-85 (Good)']++;
      else scoreBuckets['86-100 (High)']++;

      const acadLevel = s.computed?.academicRisk?.level || 'Low';
      academicRiskDist[acadLevel] = (academicRiskDist[acadLevel] || 0) + 1;
      if (acadLevel === 'High' || acadLevel === 'Critical') academicRiskCount++;

      const placeLevel = s.computed?.placementRisk?.level || 'Low';
      placementRiskDist[placeLevel] = (placementRiskDist[placeLevel] || 0) + 1;
      if (placeLevel === 'High' || placeLevel === 'Critical') placementRiskCount++;

      if (acadLevel === 'Critical' || placeLevel === 'Critical') criticalCount++;

      const segment = s.computed?.segment || 'High Performers';
      segmentDist[segment] = (segmentDist[segment] || 0) + 1;

      if (s.academic?.attendancePercentage !== null && s.academic?.attendancePercentage !== undefined) {
        totalAttendance += s.academic.attendancePercentage;
        attendanceCount++;
      }
      if (s.academic?.gpa !== null && s.academic?.gpa !== undefined) {
        totalGpa += s.academic.gpa;
        gpaCount++;
      }
      if (s.placement?.codingScore !== null && s.placement?.codingScore !== undefined) {
        totalCoding += s.placement.codingScore;
        codingCount++;
      }

      totalCoverageSum += (s.computed?.dataCoverage ?? 100);

      // Dept grouping
      const dept = s.department || 'Unknown';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { total: 0, scoreSum: 0, gpaSum: 0, gpaCount: 0, attSum: 0, attCount: 0, codingSum: 0, codingCount: 0, atRiskCount: 0 };
      }
      departmentMap[dept].total++;
      departmentMap[dept].scoreSum += score;
      if (s.academic?.gpa) { departmentMap[dept].gpaSum += s.academic.gpa; departmentMap[dept].gpaCount++; }
      if (s.academic?.attendancePercentage) { departmentMap[dept].attSum += s.academic.attendancePercentage; departmentMap[dept].attCount++; }
      if (s.placement?.codingScore) { departmentMap[dept].codingSum += s.placement.codingScore; departmentMap[dept].codingCount++; }
      if (acadLevel === 'Critical' || acadLevel === 'High' || placeLevel === 'Critical' || placeLevel === 'High') {
        departmentMap[dept].atRiskCount++;
      }
    }

    const deptComparisons = Object.entries(departmentMap).map(([dept, data]) => ({
      department: dept,
      studentCount: data.total,
      avgSuccessScore: Math.round((data.scoreSum / data.total) * 10) / 10,
      avgGpa: data.gpaCount ? Math.round((data.gpaSum / data.gpaCount) * 10) / 10 : 0,
      avgAttendance: data.attCount ? Math.round(data.attSum / data.attCount) : 0,
      avgCoding: data.codingCount ? Math.round(data.codingSum / data.codingCount) : 0,
      atRiskCount: data.atRiskCount,
    }));

    // Intervention stats
    let totalInterventions = 0;
    let pendingInterventions = 0;
    let inProgressInterventions = 0;
    let completedInterventions = 0;

    const allInterventions = isMongoActive() ? await Intervention.find().lean() : Array.from(memoryInterventions.values());
    totalInterventions = allInterventions.length;
    for (const inv of allInterventions) {
      if (inv.status === 'Pending') pendingInterventions++;
      else if (inv.status === 'In-Progress') inProgressInterventions++;
      else if (inv.status === 'Completed') completedInterventions++;
    }

    return res.json({
      success: true,
      timestamp: new Date(),
      filterApplied: { department: department || 'All', year: year || 'All' },
      summary: {
        totalStudents,
        averageSuccessScore: Math.round((totalScore / totalStudents) * 10) / 10,
        academicRiskCount,
        placementRiskCount,
        criticalAlertsCount: criticalCount,
        averageAttendance: attendanceCount ? Math.round(totalAttendance / attendanceCount) : 0,
        averageGpa: gpaCount ? Math.round((totalGpa / gpaCount) * 10) / 10 : 0,
        averageCoding: codingCount ? Math.round(totalCoding / codingCount) : 0,
        dataCompletenessRate: Math.round(totalCoverageSum / totalStudents),
        interventions: {
          total: totalInterventions,
          pending: pendingInterventions,
          inProgress: inProgressInterventions,
          completed: completedInterventions,
        },
      },
      distributions: {
        scoreBuckets,
        academicRisk: academicRiskDist,
        placementRisk: placementRiskDist,
        segments: segmentDist,
        departmentComparisons: deptComparisons,
      },
    });
  } catch (err) {
    console.error('[CampusIQ Analytics Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute campus analytics', error: err.message });
  }
}

/**
 * 2. GET /api/campusiq/students
 * Filterable, searchable, and paginated student directory
 */
async function getStudents(req, res) {
  try {
    const {
      search,
      department,
      year,
      segment,
      academicRisk,
      placementRisk,
      sortBy = 'successScore',
      order = 'desc',
      page = 1,
      limit = 25,
    } = req.query;

    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Students are not authorized to view the institution-wide student directory.',
      });
    }

    let students = await getAllStudents();

    // Faculty scoping: Restrict to faculty's department or assigned mentees
    if (req.user && req.user.role === 'faculty') {
      const facDept = req.user.department;
      const facMentor = req.user.assignedMentor;
      students = students.filter((s) => {
        if (facMentor && s.assignedMentor === facMentor) return true;
        if (facDept && (s.department === facDept || s.department.toLowerCase().includes(facDept.toLowerCase()))) return true;
        return false;
      });
    }

    // 1. Text Search (Student ID or Name)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      students = students.filter(
        (s) => s.studentId.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    // 2. Department Filter
    const targetDept = normalizeDept(department);
    if (targetDept) {
      students = students.filter((s) => s.department === targetDept || s.department.toLowerCase().includes(targetDept.toLowerCase()));
    }

    // 3. Year Filter
    if (year && year !== 'All') {
      students = students.filter((s) => s.year === Number(year));
    }

    // 4. Segment Filter
    if (segment && segment !== 'All') {
      students = students.filter((s) => s.computed?.segment === segment);
    }

    // 5. Academic Risk Filter
    if (academicRisk && academicRisk !== 'All') {
      students = students.filter((s) => s.computed?.academicRisk?.level === academicRisk);
    }

    // 6. Placement Risk Filter
    if (placementRisk && placementRisk !== 'All') {
      students = students.filter((s) => s.computed?.placementRisk?.level === placementRisk);
    }

    // 7. Sort
    students.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'urgencyScore') {
        valA = a.computed?.urgencyScore ?? 0;
        valB = b.computed?.urgencyScore ?? 0;
      } else if (sortBy === 'attendance') {
        valA = a.academic?.attendancePercentage ?? 0;
        valB = b.academic?.attendancePercentage ?? 0;
      } else if (sortBy === 'gpa') {
        valA = a.academic?.gpa ?? 0;
        valB = b.academic?.gpa ?? 0;
      } else if (sortBy === 'coding') {
        valA = a.placement?.codingScore ?? 0;
        valB = b.placement?.codingScore ?? 0;
      } else {
        // default: successScore
        valA = a.computed?.successScore ?? 0;
        valB = b.computed?.successScore ?? 0;
      }

      return order === 'asc' ? valA - valB : valB - valA;
    });

    // 8. Pagination
    const totalCount = students.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedStudents = students.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      students: paginatedStudents,
    });
  } catch (err) {
    console.error('[CampusIQ Students Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students', error: err.message });
  }
}

/**
 * 3. GET /api/campusiq/students/:studentId
 * Comprehensive Single Student Profile with Evidence, Timeline & Interventions
 */
async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;

    // 1. Horizontal privilege escalation prevention for Students
    if (req.user && req.user.role === 'student') {
      if (req.user.studentId && req.user.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied. Students can only view their own academic record. Horizontal privilege escalation blocked.',
        });
      }
    }

    let student = null;

    if (isMongoActive()) {
      student = await Student.findOne({ studentId }).lean();
    } else {
      student = memoryStudents.get(studentId);
    }

    if (!student) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }

    // 2. Department & Mentorship boundary check for Faculty
    if (req.user && req.user.role === 'faculty') {
      const facDept = req.user.department;
      const facMentor = req.user.assignedMentor;
      const matchesMentor = facMentor && student.assignedMentor === facMentor;
      const matchesDept = facDept && (student.department === facDept || student.department.toLowerCase().includes(facDept.toLowerCase()));
      if (!matchesMentor && !matchesDept) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied. Faculty members can only view students within their assigned department or mentorship cohort.',
        });
      }
    }

    // Fetch related interventions
    let studentInterventions = [];
    if (isMongoActive()) {
      studentInterventions = await Intervention.find({ studentId }).sort({ dateAssigned: -1 }).lean();
    } else {
      studentInterventions = Array.from(memoryInterventions.values()).filter((i) => i.studentId === studentId);
    }

    return res.json({
      success: true,
      student,
      interventions: studentInterventions,
    });
  } catch (err) {
    console.error('[CampusIQ Student Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student profile', error: err.message });
  }
}

/**
 * 4. GET /api/campusiq/at-risk
 * Early-Warning Radar Priority Queue
 */
async function getAtRiskStudents(req, res) {
  try {
    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Students are not authorized to view the at-risk early warning queue.',
      });
    }

    const { department, year, level, status = 'All' } = req.query;
    let students = await getAllStudents();

    // Faculty scoping: Filter queue to assigned department or mentees
    if (req.user && req.user.role === 'faculty') {
      const facDept = req.user.department;
      const facMentor = req.user.assignedMentor;
      students = students.filter((s) => {
        if (facMentor && s.assignedMentor === facMentor) return true;
        if (facDept && (s.department === facDept || s.department.toLowerCase().includes(facDept.toLowerCase()))) return true;
        return false;
      });
    }

    // Filter students who have at least Medium academic or placement risk
    students = students.filter((s) => {
      const acad = s.computed?.academicRisk?.level;
      const place = s.computed?.placementRisk?.level;
      return acad === 'Critical' || acad === 'High' || acad === 'Medium' || place === 'Critical' || place === 'High' || place === 'Medium';
    });

    const targetDept = normalizeDept(department);
    if (targetDept) {
      students = students.filter((s) => s.department === targetDept || s.department.toLowerCase().includes(targetDept.toLowerCase()));
    }
    if (year && year !== 'All') {
      students = students.filter((s) => s.year === Number(year));
    }
    if (level && level !== 'All') {
      students = students.filter((s) => s.computed?.academicRisk?.level === level || s.computed?.placementRisk?.level === level);
    }
    if (status && status !== 'All') {
      students = students.filter((s) => (s.computed?.reviewStatus || 'Pending') === status);
    }

    // Sort by Urgency Score Descending (Highest priority first)
    students.sort((a, b) => (b.computed?.urgencyScore || 0) - (a.computed?.urgencyScore || 0));

    return res.json({
      success: true,
      totalAtRisk: students.length,
      queue: students.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        department: s.department,
        year: s.year,
        successScore: s.computed?.successScore,
        academicRisk: s.computed?.academicRisk,
        placementRisk: s.computed?.placementRisk,
        urgencyScore: s.computed?.urgencyScore,
        dataCoverage: s.computed?.dataCoverage,
        reviewStatus: s.computed?.reviewStatus || 'Pending',
        lastReviewedAt: s.computed?.lastReviewedAt,
        reviewedBy: s.computed?.reviewedBy,
        reviewNotes: s.computed?.reviewNotes,
        indicators: {
          attendance: s.academic?.attendancePercentage,
          gpa: s.academic?.gpa,
          backlogs: s.academic?.backlogs,
          coding: s.placement?.codingScore,
          lmsLastActive: s.lms?.lastActiveDate,
        },
      })),
    });
  } catch (err) {
    console.error('[CampusIQ At-Risk Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve at-risk priority queue', error: err.message });
  }
}

/**
 * 5. POST /api/campusiq/at-risk/review
 * Review, acknowledge, or dismiss an alert with audit history
 */
async function reviewAtRiskAlert(req, res) {
  try {
    const { studentId, reviewStatus, reviewNotes, reviewerName } = req.body;

    if (!studentId || !reviewStatus) {
      return res.status(400).json({ success: false, message: 'studentId and reviewStatus are required' });
    }

    const reviewer = reviewerName || (req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Authorized Faculty');

    if (isMongoActive()) {
      const student = await Student.findOne({ studentId });
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      student.computed.reviewStatus = reviewStatus;
      student.computed.reviewedBy = reviewer;
      student.computed.lastReviewedAt = new Date();
      student.computed.reviewNotes = reviewNotes || '';
      await student.save();
    } else {
      const student = memoryStudents.get(studentId);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      student.computed.reviewStatus = reviewStatus;
      student.computed.reviewedBy = reviewer;
      student.computed.lastReviewedAt = new Date();
      student.computed.reviewNotes = reviewNotes || '';
      memoryStudents.set(studentId, student);
    }

    return res.json({
      success: true,
      message: `Alert for ${studentId} marked as ${reviewStatus}`,
      audit: { studentId, reviewStatus, reviewer, reviewedAt: new Date(), notes: reviewNotes },
    });
  } catch (err) {
    console.error('[CampusIQ Alert Review Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to review alert', error: err.message });
  }
}

/**
 * 6. GET /api/campusiq/segments
 * Dynamic 4-Quadrant Student Segmentation with aggregate insights
 */
async function getSegmentsOverview(req, res) {
  try {
    const { department } = req.query;
    const filter = department && department !== 'All' ? { department } : {};
    const students = await getAllStudents(filter);

    const segmentsData = {
      'High Performers': { count: 0, students: [], scoreSum: 0, avgAttendanceSum: 0, avgCodingSum: 0 },
      'Placement Focus': { count: 0, students: [], scoreSum: 0, avgAttendanceSum: 0, avgCodingSum: 0 },
      'Academic Support': { count: 0, students: [], scoreSum: 0, avgAttendanceSum: 0, avgCodingSum: 0 },
      'Intensive Support': { count: 0, students: [], scoreSum: 0, avgAttendanceSum: 0, avgCodingSum: 0 },
    };

    for (const s of students) {
      const seg = s.computed?.segment || 'High Performers';
      if (!segmentsData[seg]) continue;
      segmentsData[seg].count++;
      segmentsData[seg].scoreSum += s.computed?.successScore || 0;
      segmentsData[seg].avgAttendanceSum += s.academic?.attendancePercentage || 0;
      segmentsData[seg].avgCodingSum += s.placement?.codingScore || 0;
      segmentsData[seg].students.push({
        studentId: s.studentId,
        name: s.name,
        department: s.department,
        year: s.year,
        successScore: s.computed?.successScore,
        gpa: s.academic?.gpa,
        attendance: s.academic?.attendancePercentage,
        codingScore: s.placement?.codingScore,
      });
    }

    const segmentsFormatted = Object.entries(segmentsData).map(([name, data]) => {
      const count = data.count;
      const programs = {
        'High Performers': ['Advanced Research Mentorship', 'Tier-1 High-Frequency Placement Track', 'Peer Tutoring Leadership Program'],
        'Placement Focus': ['4-Week Intensive Coding Accelerator', 'Corporate Technical Interview Bootcamp', 'Aptitude & Logical Reasoning Masterclass'],
        'Academic Support': ['Faculty-led Theory Remedial Tutorials', 'Attendance Recovery Counseling', 'Exam Preparation Study Cohorts'],
        'Intensive Support': ['Dedicated 1-on-1 Faculty Mentor Assignment', 'Dean Academic Contract & Wellness Support', 'Foundational Skill Recovery Roadmap'],
      };

      const sharedNeeds = {
        'High Performers': 'Maintaining high trajectory, competitive hackathons, and research publications.',
        'Placement Focus': 'Bridging the practical programming and data structure gap for upcoming hiring drives.',
        'Academic Support': 'Averting semester backlogs and fulfilling institutional attendance requirements while leveraging coding talent.',
        'Intensive Support': 'Multidisciplinary intervention across academics, mental stress, and attendance regularity.',
      };

      return {
        segmentName: name,
        studentCount: count,
        percentage: students.length ? Math.round((count / students.length) * 100) : 0,
        averageSuccessScore: count ? Math.round((data.scoreSum / count) * 10) / 10 : 0,
        averageAttendance: count ? Math.round(data.avgAttendanceSum / count) : 0,
        averageCoding: count ? Math.round(data.avgCodingSum / count) : 0,
        sharedNeeds: sharedNeeds[name],
        recommendedPrograms: programs[name],
        sampleStudents: data.students.slice(0, 10),
      };
    });

    return res.json({
      success: true,
      totalStudents: students.length,
      segments: segmentsFormatted,
    });
  } catch (err) {
    console.error('[CampusIQ Segments Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve segmentation data', error: err.message });
  }
}

/**
 * 7. POST /api/campusiq/simulate
 * What-If Success Scenario Simulator
 * Calculates hypothetical score shifts without modifying the saved database record
 */
async function simulateScenario(req, res) {
  try {
    const { studentId, hypotheticalChanges } = req.body;

    if (!hypotheticalChanges) {
      return res.status(400).json({ success: false, message: 'hypotheticalChanges object is required' });
    }

    let baselineStudent = null;
    if (studentId) {
      baselineStudent = isMongoActive() ? await Student.findOne({ studentId }).lean() : memoryStudents.get(studentId);
    }

    // Fallback baseline if no specific student is selected
    if (!baselineStudent) {
      baselineStudent = {
        studentId: 'SIMULATED-BENCHMARK',
        name: 'Simulated Student',
        academic: { gpa: 6.0, attendancePercentage: 68, backlogs: 1 },
        lms: { videoCompletionRate: 50, assignmentSubmissionOnTimeRate: 60, loginFrequencyPerWeek: 2 },
        placement: { codingScore: 40, aptitudeScore: 45, mockInterviewScore: 42 },
        skills: { averageTechnical: 45, averageSoft: 50 },
        engagement: { score: 40 },
      };
    }

    // Run Baseline Engine
    const baselineProcessed = processStudentRecord(baselineStudent);

    // Create Hypothetical Copy
    const scenarioStudent = JSON.parse(JSON.stringify(baselineStudent));

    if (hypotheticalChanges.attendancePercentage !== undefined) {
      scenarioStudent.academic.attendancePercentage = Number(hypotheticalChanges.attendancePercentage);
    }
    if (hypotheticalChanges.gpa !== undefined) {
      scenarioStudent.academic.gpa = Number(hypotheticalChanges.gpa);
    }
    if (hypotheticalChanges.backlogs !== undefined) {
      scenarioStudent.academic.backlogs = Number(hypotheticalChanges.backlogs);
    }
    if (hypotheticalChanges.codingScore !== undefined) {
      scenarioStudent.placement.codingScore = Number(hypotheticalChanges.codingScore);
    }
    if (hypotheticalChanges.aptitudeScore !== undefined) {
      scenarioStudent.placement.aptitudeScore = Number(hypotheticalChanges.aptitudeScore);
    }
    if (hypotheticalChanges.videoCompletionRate !== undefined) {
      scenarioStudent.lms.videoCompletionRate = Number(hypotheticalChanges.videoCompletionRate);
    }
    if (hypotheticalChanges.assignmentSubmissionRate !== undefined) {
      scenarioStudent.lms.assignmentSubmissionOnTimeRate = Number(hypotheticalChanges.assignmentSubmissionRate);
    }

    // Run Scenario Engine
    const scenarioProcessed = processStudentRecord(scenarioStudent);

    const delta = {
      scoreDiff: Math.round((scenarioProcessed.successScore - baselineProcessed.successScore) * 10) / 10,
      academicRiskBefore: baselineProcessed.academicRisk.level,
      academicRiskAfter: scenarioProcessed.academicRisk.level,
      placementRiskBefore: baselineProcessed.placementRisk.level,
      placementRiskAfter: scenarioProcessed.placementRisk.level,
      segmentBefore: baselineProcessed.segment,
      segmentAfter: scenarioProcessed.segment,
      contributors: [],
    };

    if (hypotheticalChanges.attendancePercentage !== undefined) {
      const attDiff = Number(hypotheticalChanges.attendancePercentage) - (baselineStudent.academic?.attendancePercentage || 0);
      delta.contributors.push({
        indicator: 'Attendance',
        change: `${attDiff > 0 ? '+' : ''}${attDiff}%`,
        weight: '20%',
        impact: attDiff > 0 ? 'Positive Risk Reduction' : 'Increased Risk',
      });
    }

    if (hypotheticalChanges.codingScore !== undefined) {
      const codeDiff = Number(hypotheticalChanges.codingScore) - (baselineStudent.placement?.codingScore || 0);
      delta.contributors.push({
        indicator: 'Coding Benchmark',
        change: `${codeDiff > 0 ? '+' : ''}${codeDiff} pts`,
        weight: '20%',
        impact: codeDiff > 0 ? 'Placement Readiness Acceleration' : 'Below Cutoff',
      });
    }

    return res.json({
      success: true,
      studentId: baselineStudent.studentId,
      name: baselineStudent.name,
      baseline: {
        successScore: baselineProcessed.successScore,
        academicRisk: baselineProcessed.academicRisk,
        placementRisk: baselineProcessed.placementRisk,
        segment: baselineProcessed.segment,
        breakdown: baselineProcessed.scoreBreakdown,
      },
      scenario: {
        successScore: scenarioProcessed.successScore,
        academicRisk: scenarioProcessed.academicRisk,
        placementRisk: scenarioProcessed.placementRisk,
        segment: scenarioProcessed.segment,
        breakdown: scenarioProcessed.scoreBreakdown,
      },
      delta,
      disclaimer: 'What-If calculations are hypothetical decision-support simulations and do not guarantee future student performance.',
    });
  } catch (err) {
    console.error('[CampusIQ Simulator Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to run scenario simulation', error: err.message });
  }
}

/**
 * 8. GET /api/campusiq/interventions
 * Action Intelligence: List all interventions with filters
 */
async function getInterventions(req, res) {
  try {
    const { status, category, priority, department } = req.query;
    let list = isMongoActive()
      ? await Intervention.find().sort({ dateAssigned: -1 }).lean()
      : Array.from(memoryInterventions.values()).sort((a, b) => new Date(b.dateAssigned) - new Date(a.dateAssigned));

    // Role-based visibility scoping
    if (req.user && req.user.role === 'student') {
      const studentId = req.user.studentId;
      list = list.filter((i) => i.studentId === studentId);
    } else if (req.user && req.user.role === 'faculty') {
      const facDept = req.user.department;
      const facMentor = req.user.assignedMentor;
      list = list.filter((i) => {
        if (facMentor && i.mentorAssigned && i.mentorAssigned.includes(facMentor)) return true;
        if (facDept && i.department === facDept) return true;
        return false;
      });
    }

    if (status && status !== 'All') {
      list = list.filter((i) => i.status === status);
    }
    if (category && category !== 'All') {
      list = list.filter((i) => i.actionCategory === category);
    }
    if (priority && priority !== 'All') {
      list = list.filter((i) => i.priority === priority);
    }
    if (department && department !== 'All') {
      list = list.filter((i) => i.department === department);
    }

    return res.json({
      success: true,
      totalCount: list.length,
      interventions: list,
    });
  } catch (err) {
    console.error('[CampusIQ Interventions Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interventions', error: err.message });
  }
}

/**
 * 9. POST /api/campusiq/interventions
 * Create and assign a human-reviewed intervention linked to evidence
 */
async function createIntervention(req, res) {
  try {
    const {
      studentId,
      concernType,
      concernTitle,
      concernDescription,
      evidence = [],
      recommendedAction,
      actionCategory,
      priority = 'Medium',
      mentorAssigned,
      dueDate,
      followUpDate,
    } = req.body;

    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Students are not authorized to create interventions.',
      });
    }

    if (!studentId || !concernTitle || !recommendedAction || !actionCategory) {
      return res.status(400).json({ success: false, message: 'studentId, concernTitle, recommendedAction, and actionCategory are required' });
    }

    let student = isMongoActive() ? await Student.findOne({ studentId }) : memoryStudents.get(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${studentId} not found` });
    }

    const interventionId = `INT-${Date.now().toString().slice(-6)}`;
    const newIntervention = {
      interventionId,
      studentId,
      studentName: student.name,
      department: student.department,
      year: student.year,
      concernType: concernType || 'academic',
      concernTitle,
      concernDescription: concernDescription || 'Targeted support action based on early-warning signal',
      evidence,
      recommendedAction,
      actionCategory,
      priority,
      mentorAssigned: mentorAssigned || student.assignedMentor || 'Dr. S. Sharma',
      dateAssigned: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      followUpDate: followUpDate ? new Date(followUpDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: 'In-Progress',
      notes: [{ author: mentorAssigned || 'Faculty', note: 'Intervention plan initiated and approved.', timestamp: new Date() }],
      baselineIndicators: {
        gpa: student.academic?.gpa,
        attendance: student.academic?.attendancePercentage,
        codingScore: student.placement?.codingScore,
        aptitudeScore: student.placement?.aptitudeScore,
        successScore: student.computed?.successScore,
        capturedAt: new Date(),
      },
    };

    if (isMongoActive()) {
      await Intervention.create(newIntervention);
    } else {
      memoryInterventions.set(interventionId, newIntervention);
    }

    return res.status(201).json({
      success: true,
      message: `Intervention ${interventionId} created and assigned`,
      intervention: newIntervention,
    });
  } catch (err) {
    console.error('[CampusIQ Create Intervention Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create intervention', error: err.message });
  }
}

/**
 * 10. PATCH /api/campusiq/interventions/:id
 * Update intervention status, record follow-up indicators, and review outcomes
 */
async function updateIntervention(req, res) {
  try {
    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Students are not authorized to update faculty interventions.',
      });
    }

    const { id } = req.params;
    const { status, note, followUpIndicators, outcomeReview } = req.body;

    let target = isMongoActive() ? await Intervention.findOne({ interventionId: id }) : memoryInterventions.get(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Intervention not found' });
    }

    if (status) target.status = status;

    if (note && note.trim()) {
      target.notes.push({
        author: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Faculty / Mentor',
        note: note.trim(),
        timestamp: new Date(),
      });
    }

    if (followUpIndicators) {
      target.followUpIndicators = {
        ...followUpIndicators,
        measuredAt: new Date(),
      };

      // Calculate before-and-after observed changes
      const base = target.baselineIndicators || {};
      const follow = followUpIndicators;

      const attDelta = follow.attendance !== undefined && base.attendance !== undefined ? follow.attendance - base.attendance : 0;
      const scoreDelta = follow.successScore !== undefined && base.successScore !== undefined ? Math.round((follow.successScore - base.successScore) * 10) / 10 : 0;
      const codeDelta = follow.codingScore !== undefined && base.codingScore !== undefined ? follow.codingScore - base.codingScore : 0;

      target.observedChanges = {
        attendanceDelta: attDelta,
        successScoreDelta: scoreDelta,
        codingDelta: codeDelta,
        qualitativeSummary: `Attendance: ${attDelta >= 0 ? '+' : ''}${attDelta}%, Coding: ${codeDelta >= 0 ? '+' : ''}${codeDelta} pts, Overall Score: ${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`,
      };
    }

    if (outcomeReview) {
      target.outcomeReview = {
        ...outcomeReview,
        reviewedAt: new Date(),
        reviewedBy: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Reviewing Committee',
      };
    }

    if (isMongoActive()) {
      await target.save();
    } else {
      memoryInterventions.set(id, target);
    }

    return res.json({
      success: true,
      message: `Intervention ${id} updated`,
      intervention: target,
    });
  } catch (err) {
    console.error('[CampusIQ Update Intervention Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update intervention', error: err.message });
  }
}

/**
 * 11. GET /api/campusiq/data-hub/history
 * List import history and data completeness overview
 */
async function getDataHubHistory(req, res) {
  try {
    const history = isMongoActive()
      ? await DataImport.find().sort({ createdAt: -1 }).lean()
      : [...memoryDataImports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const students = await getAllStudents();
    const totalStudents = students.length;

    const completeness = {
      academicRecords: Math.round((students.filter((s) => s.academic?.gpa !== null).length / (totalStudents || 1)) * 100),
      attendanceRecords: Math.round((students.filter((s) => s.academic?.attendancePercentage !== null).length / (totalStudents || 1)) * 100),
      lmsActivity: Math.round((students.filter((s) => s.lms?.videoCompletionRate !== null).length / (totalStudents || 1)) * 100),
      placementAssessments: Math.round((students.filter((s) => s.placement?.codingScore !== null).length / (totalStudents || 1)) * 100),
      skillsAssessments: Math.round((students.filter((s) => s.skills?.averageTechnical !== null).length / (totalStudents || 1)) * 100),
      engagementRecords: Math.round((students.filter((s) => s.engagement?.score !== null).length / (totalStudents || 1)) * 100),
    };

    return res.json({
      success: true,
      totalImports: history.length,
      history,
      completeness,
      freshness: {
        lastAcademicImport: '2 days ago',
        lastAttendanceSync: 'Today at 08:30 AM',
        lastLmsSync: 'Today at 04:00 AM',
      },
    });
  } catch (err) {
    console.error('[CampusIQ Data Hub Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve data hub history', error: err.message });
  }
}

/**
 * 12. POST /api/campusiq/data-hub/upload
 * CSV upload & validation handler for 8 categories
 */
async function uploadDataset(req, res) {
  try {
    const { datasetCategory, csvContent, fileName = 'uploaded_dataset.csv' } = req.body;

    if (!datasetCategory || !csvContent) {
      return res.status(400).json({ success: false, message: 'datasetCategory and csvContent string are required' });
    }

    const lines = csvContent.trim().split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file must contain a header row and at least one data row' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const studentIdIndex = headers.findIndex((h) => h === 'studentid' || h === 'student_id' || h === 'id');

    if (studentIdIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: CSV missing mandatory primary key column: student_id or studentId',
      });
    }

    let successCount = 0;
    let duplicateCount = 0;
    const rejectedDetails = [];
    const seenIdsInBatch = new Set();

    for (let r = 1; r < lines.length; r++) {
      const cols = lines[r].split(',').map((c) => c.trim());
      const stuId = cols[studentIdIndex];

      if (!stuId) {
        rejectedDetails.push({ rowNumber: r + 1, studentId: 'MISSING', reason: 'Empty student_id column', dataSnippet: lines[r] });
        continue;
      }

      // Check duplicate within batch
      if (seenIdsInBatch.has(stuId)) {
        duplicateCount++;
        rejectedDetails.push({ rowNumber: r + 1, studentId: stuId, reason: 'Duplicate row detected in uploaded file', dataSnippet: lines[r] });
        continue;
      }
      seenIdsInBatch.add(stuId);

      // Value validation by category
      let student = isMongoActive() ? await Student.findOne({ studentId: stuId }) : memoryStudents.get(stuId);

      if (!student) {
        rejectedDetails.push({ rowNumber: r + 1, studentId: stuId, reason: 'Unmatched Student ID (Not found in Student Master)', dataSnippet: lines[r] });
        continue;
      }

      // Merge data
      let isValid = true;
      if (datasetCategory === 'Attendance') {
        const attCol = headers.findIndex((h) => h.includes('attendance') || h.includes('percentage'));
        if (attCol !== -1) {
          const val = Number(cols[attCol]);
          if (isNaN(val) || val < 0 || val > 100) {
            rejectedDetails.push({ rowNumber: r + 1, studentId: stuId, reason: `Invalid attendance value ${cols[attCol]} (Must be 0 - 100)`, dataSnippet: lines[r] });
            isValid = false;
          } else {
            student.academic.attendancePercentage = val;
          }
        }
      } else if (datasetCategory === 'Academic Records') {
        const gpaCol = headers.findIndex((h) => h === 'gpa' || h === 'cgpa');
        if (gpaCol !== -1) {
          const val = Number(cols[gpaCol]);
          if (isNaN(val) || val < 0 || val > 10) {
            rejectedDetails.push({ rowNumber: r + 1, studentId: stuId, reason: `Invalid GPA value ${cols[gpaCol]} (Must be 0.0 - 10.0 scale)`, dataSnippet: lines[r] });
            isValid = false;
          } else {
            student.academic.gpa = val;
          }
        }
      } else if (datasetCategory === 'Placement Assessments') {
        const codeCol = headers.findIndex((h) => h.includes('coding') || h.includes('score'));
        if (codeCol !== -1) {
          const val = Number(cols[codeCol]);
          if (isNaN(val) || val < 0 || val > 100) {
            rejectedDetails.push({ rowNumber: r + 1, studentId: stuId, reason: `Invalid coding score ${cols[codeCol]} (Must be 0 - 100)`, dataSnippet: lines[r] });
            isValid = false;
          } else {
            student.placement.codingScore = val;
          }
        }
      }

      if (isValid) {
        // Re-run scoring engine on updated record
        student.computed = processStudentRecord(student);
        if (isMongoActive()) {
          await student.save();
        } else {
          memoryStudents.set(stuId, student);
        }
        successCount++;
      }
    }

    const importRecord = {
      importId: `IMP-${Date.now().toString().slice(-6)}`,
      datasetCategory,
      fileName,
      fileSizeKB: Math.round(csvContent.length / 1024),
      totalRows: lines.length - 1,
      successfulRows: successCount,
      rejectedRows: rejectedDetails.length,
      duplicateRows: duplicateCount,
      rejectedDetails,
      status: rejectedDetails.length === 0 ? 'Success' : successCount > 0 ? 'Partial' : 'Failed',
      uploadedBy: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Authorized User',
      createdAt: new Date(),
    };

    if (isMongoActive()) {
      await DataImport.create(importRecord);
    } else {
      memoryDataImports.unshift(importRecord);
    }

    return res.json({
      success: true,
      message: `Import processed: ${successCount} rows updated, ${rejectedDetails.length} rows rejected`,
      summary: importRecord,
    });
  } catch (err) {
    console.error('[CampusIQ Upload Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to process dataset upload', error: err.message });
  }
}

/**
 * 13. POST /api/campusiq/data-hub/reset-demo
 * Restores the clean reproducible 200-student benchmark dataset
 */
async function resetDemoData(req, res) {
  try {
    const students = generateSyntheticStudents(200);
    const interventions = generateSampleInterventions(students);

    if (isMongoActive()) {
      await Student.deleteMany({});
      await Student.insertMany(students);
      await Intervention.deleteMany({});
      await Intervention.insertMany(interventions);
    } else {
      memoryStudents.clear();
      for (const s of students) memoryStudents.set(s.studentId, s);
      memoryInterventions.clear();
      for (const i of interventions) memoryInterventions.set(i.interventionId, i);
    }

    return res.json({
      success: true,
      message: 'Demo dataset reset successfully to 200 benchmark student records',
      studentCount: students.length,
      interventionCount: interventions.length,
    });
  } catch (err) {
    console.error('[CampusIQ Reset Demo Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset demo dataset', error: err.message });
  }
}

/**
 * 14. GET & POST /api/campusiq/config
 * View & modify configurable weights and risk thresholds
 */
async function getConfig(req, res) {
  return res.json({
    success: true,
    weights: campusiqConfig.weights || DEFAULT_WEIGHTS,
    thresholds: campusiqConfig.thresholds || DEFAULT_THRESHOLDS,
  });
}

async function updateConfig(req, res) {
  try {
    const { weights, thresholds } = req.body;
    if (weights) {
      campusiqConfig.weights = { ...DEFAULT_WEIGHTS, ...weights };
    }
    if (thresholds) {
      campusiqConfig.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    }

    // Re-score all in-memory students with new weights
    const students = await getAllStudents();
    for (const s of students) {
      s.computed = processStudentRecord(s, campusiqConfig.weights, campusiqConfig.thresholds);
      if (isMongoActive()) {
        await Student.updateOne({ studentId: s.studentId }, { computed: s.computed });
      } else {
        memoryStudents.set(s.studentId, s);
      }
    }

    return res.json({
      success: true,
      message: 'Institutional weights and risk thresholds updated. All student scores recalculated.',
      config: campusiqConfig,
    });
  } catch (err) {
    console.error('[CampusIQ Config Update Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update configuration', error: err.message });
  }
}

/**
 * 15. GET /api/campusiq/reports/export
 * Download CSV reports: Campus Overview, Risk Register, Segments, or Interventions
 */
async function exportReport(req, res) {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Report exports containing protected institutional data are restricted exclusively to Administrators.',
      });
    }

    const { type = 'risk-register' } = req.query;
    const students = await getAllStudents();

    let csvContent = '';
    let fileName = 'campusiq_report.csv';

    if (type === 'risk-register') {
      fileName = 'campusiq_risk_register.csv';
      csvContent = 'Student ID,Name,Department,Year,Success Score,Academic Risk,Placement Risk,Attendance %,GPA,Coding Score,Urgency Score,Review Status\n';
      const atRisk = students.filter(
        (s) => s.computed?.academicRisk?.level !== 'Low' || s.computed?.placementRisk?.level !== 'Low'
      );
      for (const s of atRisk) {
        csvContent += `"${s.studentId}","${s.name}","${s.department}",${s.year},${s.computed?.successScore || 0},"${s.computed?.academicRisk?.level}","${s.computed?.placementRisk?.level}",${s.academic?.attendancePercentage || ''},${s.academic?.gpa || ''},${s.placement?.codingScore || ''},${s.computed?.urgencyScore || 0},"${s.computed?.reviewStatus || 'Pending'}"\n`;
      }
    } else if (type === 'segments') {
      fileName = 'campusiq_student_segments.csv';
      csvContent = 'Student ID,Name,Department,Year,Segment,Success Score,GPA,Attendance %,Coding Score\n';
      for (const s of students) {
        csvContent += `"${s.studentId}","${s.name}","${s.department}",${s.year},"${s.computed?.segment || ''}",${s.computed?.successScore || 0},${s.academic?.gpa || ''},${s.academic?.attendancePercentage || ''},${s.placement?.codingScore || ''}\n`;
      }
    } else if (type === 'interventions') {
      fileName = 'campusiq_interventions_log.csv';
      csvContent = 'Intervention ID,Student ID,Student Name,Department,Category,Priority,Status,Assigned Date,Due Date,Mentor,Observed Outcome\n';
      const allInt = isMongoActive() ? await Intervention.find().lean() : Array.from(memoryInterventions.values());
      for (const i of allInt) {
        csvContent += `"${i.interventionId}","${i.studentId}","${i.studentName}","${i.department}","${i.actionCategory}","${i.priority}","${i.status}","${new Date(i.dateAssigned).toLocaleDateString()}","${new Date(i.dueDate).toLocaleDateString()}","${i.mentorAssigned}","${i.observedChanges?.qualitativeSummary || 'In-Progress'}"\n`;
      }
    } else {
      // General Campus Overview
      fileName = 'campusiq_students_master.csv';
      csvContent = 'Student ID,Name,Department,Year,Success Score,Coverage %,Academic Risk,Placement Risk,Segment\n';
      for (const s of students) {
        csvContent += `"${s.studentId}","${s.name}","${s.department}",${s.year},${s.computed?.successScore || 0},${s.computed?.dataCoverage || 100},"${s.computed?.academicRisk?.level}","${s.computed?.placementRisk?.level}","${s.computed?.segment}"\n`;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('[CampusIQ Export Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate report export', error: err.message });
  }
}

/**
 * 16. GET /api/campusiq/student/me
 * Secure Self Student Profile (No URL parameter needed)
 */
async function getStudentSelfProfile(req, res) {
  try {
    const studentId = req.user?.studentId || 'STU2026-001';
    let student = isMongoActive()
      ? await Student.findOne({ studentId }).lean()
      : memoryStudents.get(studentId);

    if (!student) {
      const all = await getAllStudents();
      student = all.find((s) => s.email === req.user?.email) || all[0];
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const allInt = isMongoActive()
      ? await Intervention.find({ studentId: student.studentId }).lean()
      : Array.from(memoryInterventions.values()).filter((i) => i.studentId === student.studentId);

    return res.json({
      success: true,
      student,
      interventions: allInt,
    });
  } catch (err) {
    console.error('[CampusIQ Student Self Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student profile', error: err.message });
  }
}

/**
 * 17. GET /api/campusiq/student/dashboard
 * Constructive, supportive student success metrics & personalized recommendations
 */
async function getStudentDashboardData(req, res) {
  try {
    const studentId = req.user?.studentId || 'STU2026-001';
    let student = isMongoActive()
      ? await Student.findOne({ studentId }).lean()
      : memoryStudents.get(studentId);

    if (!student) {
      const all = await getAllStudents();
      student = all.find((s) => s.email === req.user?.email) || all[0];
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student academic record not found' });
    }

    const allInt = isMongoActive()
      ? await Intervention.find({ studentId: student.studentId }).lean()
      : Array.from(memoryInterventions.values()).filter((i) => i.studentId === student.studentId);

    const recommendations = [
      {
        id: 'REC-1',
        title: 'Algorithms & Data Structures Lab Practice',
        category: 'Coding Benchmark',
        priority: (student.placement?.codingScore || 0) < 60 ? 'High' : 'Normal',
        description: 'Complete 3 weekly graph algorithms problems on the portal to enhance campus placement readiness.',
        actionUrl: '/chat',
        actionLabel: 'Consult AI Mentor',
      },
      {
        id: 'REC-2',
        title: 'Core Theory & Peer Study Circle',
        category: 'Academic Health',
        priority: (student.academic?.gpa || 0) < 7.5 ? 'High' : 'Normal',
        description: 'Participate in Thursday study group for Operating Systems memory management and architecture.',
        actionUrl: '/roadmap',
        actionLabel: 'View Study Roadmap',
      },
      {
        id: 'REC-3',
        title: 'AI Mock Technical Interview',
        category: 'Placement Readiness',
        priority: 'Normal',
        description: 'Simulate technical and behavioral hiring rounds with instant AI feedback and diagnostic scoring.',
        actionUrl: '/interview',
        actionLabel: 'Start Mock Interview',
      },
    ];

    const upcomingTasks = [
      { id: 'TSK-101', title: 'Mid-Term Lab Practical Evaluation', subject: student.department, dueDate: 'In 4 days', type: 'Lab Practical', status: 'Upcoming' },
      { id: 'TSK-102', title: 'Database Systems Normalization Project', subject: 'DBMS', dueDate: 'In 7 days', type: 'Assignment', status: 'In-Progress' },
      { id: 'TSK-103', title: 'Campus Placement Aptitude Benchmark Test', subject: 'Training & Placement Cell', dueDate: 'In 12 days', type: 'Assessment', status: 'Scheduled' },
    ];

    const supportResources = [
      { title: 'Academic Peer Tutoring Center', location: 'Block B, Room 204', timings: 'Mon - Fri, 3:00 PM - 6:00 PM', contact: 'tutoring@campus.edu.in' },
      { title: 'Faculty Mentorship Office Hours', location: student.assignedMentor || 'Faculty Cabin 12', timings: 'Tue & Thu, 2:00 PM - 4:00 PM', contact: 'mentorship@campus.edu.in' },
      { title: 'Student Counselling & Wellness Helpline', location: 'Health & Wellness Center', timings: '24/7 Confidential Assistance', contact: 'wellness@campus.edu.in' },
    ];

    return res.json({
      success: true,
      student: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        semester: student.semester,
        assignedMentor: student.assignedMentor,
        academic: student.academic,
        placement: student.placement,
        behavioral: student.behavioral,
        computed: {
          academicHealthScore: student.computed?.successScore || 78,
          attendancePercentage: student.academic?.attendancePercentage || 85,
          currentGpa: student.academic?.gpa || 7.5,
          codingScore: student.placement?.codingScore || 65,
          activeBacklogs: student.academic?.backlogs || 0,
          dataCoverage: student.computed?.dataCoverage || 95,
        },
      },
      recommendations,
      upcomingTasks,
      supportResources,
      interventions: allInt.map((i) => ({
        interventionId: i.interventionId,
        concernTitle: i.concernTitle,
        recommendedAction: i.recommendedAction,
        actionCategory: i.actionCategory,
        mentorAssigned: i.mentorAssigned,
        status: i.status,
        dueDate: i.dueDate,
        followUpDate: i.followUpDate,
      })),
    });
  } catch (err) {
    console.error('[CampusIQ Student Dashboard Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student dashboard data', error: err.message });
  }
}

/**
 * 18. GET /api/campusiq/faculty/dashboard
 * Faculty / Academic Advisor Dashboard: Scoped to assigned mentees and department
 */
async function getFacultyDashboardData(req, res) {
  try {
    const facDept = req.user?.department || 'Computer Science & Engineering';
    const facMentor = req.user?.assignedMentor;
    const facName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Dr. S. Sharma';

    let allStudents = await getAllStudents();

    let mentees = allStudents.filter((s) => {
      if (facMentor && s.assignedMentor === facMentor) return true;
      if (facDept && (s.department === facDept || s.department.toLowerCase().includes(facDept.toLowerCase()))) return true;
      return false;
    });

    if (mentees.length === 0) {
      mentees = allStudents.slice(0, 50);
    }

    const attentionNeeded = mentees
      .filter((s) => {
        const urg = s.computed?.urgencyScore || 0;
        const acad = s.computed?.academicRisk?.level;
        const place = s.computed?.placementRisk?.level;
        return urg >= 50 || acad === 'Critical' || acad === 'High' || place === 'Critical';
      })
      .sort((a, b) => (b.computed?.urgencyScore || 0) - (a.computed?.urgencyScore || 0));

    let totalScore = 0;
    let totalAttendance = 0;
    let totalGpa = 0;
    for (const s of mentees) {
      totalScore += s.computed?.successScore || 0;
      totalAttendance += s.academic?.attendancePercentage || 0;
      totalGpa += s.academic?.gpa || 0;
    }
    const menteeCount = mentees.length;

    const allInt = isMongoActive() ? await Intervention.find().lean() : Array.from(memoryInterventions.values());
    const menteeIds = new Set(mentees.map((s) => s.studentId));
    const activeInterventions = allInt.filter(
      (i) => menteeIds.has(i.studentId) || (facMentor && i.mentorAssigned?.includes(facMentor))
    );

    const upcomingFollowUps = activeInterventions.filter((i) => i.status === 'In-Progress' || i.status === 'Pending').slice(0, 5);

    return res.json({
      success: true,
      facultyProfile: {
        name: facName,
        department: facDept,
        assignedMentorTitle: facMentor || `Prof. ${facName}`,
        totalAssignedMentees: menteeCount,
        requiresAttentionCount: attentionNeeded.length,
      },
      cohortSummary: {
        totalMentees: menteeCount,
        criticalAlertCount: attentionNeeded.length,
        avgSuccessScore: Math.round((totalScore / menteeCount) * 10) / 10,
        avgAttendance: Math.round(totalAttendance / menteeCount),
        avgGpa: Math.round((totalGpa / menteeCount) * 10) / 10,
        activeInterventionsCount: activeInterventions.length,
      },
      urgentMentees: attentionNeeded.slice(0, 10).map((s) => ({
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        department: s.department,
        semester: s.semester,
        successScore: s.computed?.successScore,
        urgencyScore: s.computed?.urgencyScore,
        attendance: s.academic?.attendancePercentage,
        gpa: s.academic?.gpa,
        backlogs: s.academic?.backlogs,
        academicRisk: s.computed?.academicRisk?.level,
        placementRisk: s.computed?.placementRisk?.level,
        primaryFactors: s.computed?.academicRisk?.factors || ['Attendance drift below 75% threshold', 'Midterm examination score deviation'],
        recommendedIntervention: s.computed?.academicRisk?.recommendedAction || 'Schedule 1-on-1 Academic Advising',
        reviewStatus: s.computed?.reviewStatus || 'Pending',
      })),
      assignedMentees: mentees.slice(0, 20),
      activeInterventions,
      upcomingFollowUps,
    });
  } catch (err) {
    console.error('[CampusIQ Faculty Dashboard Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve faculty dashboard data', error: err.message });
  }
}

module.exports = {
  getAnalyticsOverview,
  getStudents,
  getStudentById,
  getStudentSelfProfile,
  getStudentDashboardData,
  getFacultyDashboardData,
  getAtRiskStudents,
  reviewAtRiskAlert,
  getSegmentsOverview,
  simulateScenario,
  getInterventions,
  createIntervention,
  updateIntervention,
  getDataHubHistory,
  uploadDataset,
  resetDemoData,
  getConfig,
  updateConfig,
  exportReport,
};
