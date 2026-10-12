/**
 * CampusIQ Scoring & Dual-Risk Detection Engine
 * 
 * Provides transparent, mathematically rigorous Student Success Scores,
 * separate Academic and Placement Risk assessments, and Dynamic Segmentation.
 */

// Default configurable weights (institutional defaults)
const DEFAULT_WEIGHTS = {
  academic: 0.30,      // Academic Performance (GPA, marks, backlogs)
  attendance: 0.20,    // Class & Lab Attendance
  lms: 0.15,           // LMS Ingestion & Engagement
  placement: 0.20,     // Coding, Aptitude, Mock Interviews
  skills: 0.10,        // Technical & Soft Skill Benchmarks
  engagement: 0.05,    // Extracurriculars & Clubs
};

// Default configurable risk thresholds
const DEFAULT_THRESHOLDS = {
  attendanceWarning: 75,
  attendanceCritical: 65,
  gpaWarning: 6.5,      // on 10-point scale
  gpaCritical: 5.5,
  backlogWarning: 1,
  backlogCritical: 2,
  codingWarning: 50,
  codingCritical: 35,
  aptitudeWarning: 50,
  aptitudeCritical: 40,
  lmsInactivityDaysWarning: 14,
  lmsInactivityDaysCritical: 28,
  minDataCoverageForFinal: 70, // percent
};

/**
 * Normalizes an indicator safely
 */
function normalizeScore(val, min = 0, max = 100) {
  if (val === null || val === undefined || isNaN(val)) return null;
  const num = Number(val);
  const clamped = Math.max(min, Math.min(max, num));
  return ((clamped - min) / (max - min)) * 100;
}

/**
 * Calculates the transparent Student Success Score (0 - 100)
 * Handles missing data without penalizing by treating missing as zero.
 */
function calculateStudentSuccessScore(studentData, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // 1. Academic Normalization (GPA 0-10 -> 0-100)
  let academicNorm = null;
  if (studentData.academic?.gpa !== null && studentData.academic?.gpa !== undefined) {
    academicNorm = normalizeScore(studentData.academic.gpa, 0, 10);
    // Slight deduction if backlogs exist
    if (studentData.academic.backlogs > 0) {
      academicNorm = Math.max(0, academicNorm - studentData.academic.backlogs * 8);
    }
  }

  // 2. Attendance Normalization (0-100)
  let attendanceNorm = null;
  if (studentData.academic?.attendancePercentage !== null && studentData.academic?.attendancePercentage !== undefined) {
    attendanceNorm = normalizeScore(studentData.academic.attendancePercentage, 0, 100);
  }

  // 3. LMS Normalization (0-100)
  let lmsNorm = null;
  const lmsComponents = [];
  if (studentData.lms?.videoCompletionRate !== null && studentData.lms?.videoCompletionRate !== undefined) {
    lmsComponents.push(studentData.lms.videoCompletionRate);
  }
  if (studentData.lms?.assignmentSubmissionOnTimeRate !== null && studentData.lms?.assignmentSubmissionOnTimeRate !== undefined) {
    lmsComponents.push(studentData.lms.assignmentSubmissionOnTimeRate);
  }
  if (studentData.lms?.loginFrequencyPerWeek !== null && studentData.lms?.loginFrequencyPerWeek !== undefined) {
    // 5 logins/week = 100%
    lmsComponents.push(Math.min(100, (studentData.lms.loginFrequencyPerWeek / 5) * 100));
  }
  if (lmsComponents.length > 0) {
    lmsNorm = lmsComponents.reduce((acc, c) => acc + c, 0) / lmsComponents.length;
  }

  // 4. Placement Readiness Normalization (0-100)
  let placementNorm = null;
  const placementComponents = [];
  if (studentData.placement?.codingScore !== null && studentData.placement?.codingScore !== undefined) {
    placementComponents.push(studentData.placement.codingScore);
  }
  if (studentData.placement?.aptitudeScore !== null && studentData.placement?.aptitudeScore !== undefined) {
    placementComponents.push(studentData.placement.aptitudeScore);
  }
  if (studentData.placement?.mockInterviewScore !== null && studentData.placement?.mockInterviewScore !== undefined) {
    placementComponents.push(studentData.placement.mockInterviewScore);
  }
  if (placementComponents.length > 0) {
    placementNorm = placementComponents.reduce((acc, c) => acc + c, 0) / placementComponents.length;
  }

  // 5. Skills Normalization (0-100)
  let skillsNorm = null;
  const skillComponents = [];
  if (studentData.skills?.averageTechnical !== null && studentData.skills?.averageTechnical !== undefined) {
    skillComponents.push(studentData.skills.averageTechnical);
  }
  if (studentData.skills?.averageSoft !== null && studentData.skills?.averageSoft !== undefined) {
    skillComponents.push(studentData.skills.averageSoft);
  }
  if (skillComponents.length > 0) {
    skillsNorm = skillComponents.reduce((acc, c) => acc + c, 0) / skillComponents.length;
  }

  // 6. Extracurricular Normalization (0-100)
  let engagementNorm = null;
  if (studentData.engagement?.score !== null && studentData.engagement?.score !== undefined) {
    engagementNorm = normalizeScore(studentData.engagement.score, 0, 100);
  } else if (studentData.engagement?.eventsAttendedCount !== null && studentData.engagement?.eventsAttendedCount !== undefined) {
    engagementNorm = Math.min(100, studentData.engagement.eventsAttendedCount * 20);
  }

  // Assemble Component Contributions
  const components = {
    academic: { raw: studentData.academic?.gpa, normalized: academicNorm, weight: weights.academic },
    attendance: { raw: studentData.academic?.attendancePercentage, normalized: attendanceNorm, weight: weights.attendance },
    lms: { raw: lmsNorm, normalized: lmsNorm, weight: weights.lms },
    placement: { raw: placementNorm, normalized: placementNorm, weight: weights.placement },
    skills: { raw: skillsNorm, normalized: skillsNorm, weight: weights.skills },
    engagement: { raw: engagementNorm, normalized: engagementNorm, weight: weights.engagement },
  };

  let activeWeightSum = 0;
  let weightedScoreSum = 0;
  const missingIndicators = [];
  const scoreBreakdown = {};

  for (const [key, comp] of Object.entries(components)) {
    const isPresent = comp.normalized !== null && comp.normalized !== undefined;
    if (isPresent) {
      activeWeightSum += comp.weight;
      const contribution = comp.normalized * comp.weight;
      weightedScoreSum += contribution;
      scoreBreakdown[key] = {
        value: Math.round(comp.raw !== null ? comp.raw : comp.normalized),
        normalized: Math.round(comp.normalized * 10) / 10,
        weight: comp.weight,
        contribution: Math.round(contribution * 10) / 10,
        coverage: true,
      };
    } else {
      missingIndicators.push(key);
      scoreBreakdown[key] = {
        value: null,
        normalized: null,
        weight: comp.weight,
        contribution: 0,
        coverage: false,
      };
    }
  }

  const coveragePercent = Math.round((activeWeightSum / 1.0) * 100);
  const isProvisional = coveragePercent < 100;

  // Mathematically scale by active weights so missing data does NOT depress score
  let finalSuccessScore = activeWeightSum > 0 ? (weightedScoreSum / activeWeightSum) : 0;
  finalSuccessScore = Math.round(Math.max(0, Math.min(100, finalSuccessScore)) * 10) / 10;

  return {
    successScore: finalSuccessScore,
    isProvisional,
    dataCoverage: coveragePercent,
    missingIndicators,
    scoreBreakdown,
    weights,
  };
}

/**
 * Evaluates Separate Academic and Placement Readiness Risks
 * Produces explainable reasons, dates of evidence, and trend directions.
 */
function evaluateDualRisk(studentData, customThresholds = {}) {
  const t = { ...DEFAULT_THRESHOLDS, ...customThresholds };

  // ================= A. ACADEMIC RISK =================
  let academicRiskScore = 0;
  const academicReasons = [];
  const academicEvidenceDates = [];

  const att = studentData.academic?.attendancePercentage;
  if (att !== null && att !== undefined) {
    if (att < t.attendanceCritical) {
      academicRiskScore += 45;
      academicReasons.push(`Critical attendance deficit (${att}% is below critical threshold of ${t.attendanceCritical}%)`);
      academicEvidenceDates.push(new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));
    } else if (att < t.attendanceWarning) {
      academicRiskScore += 25;
      academicReasons.push(`Attendance warning (${att}% is below mandatory institutional threshold of ${t.attendanceWarning}%)`);
      academicEvidenceDates.push(new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));
    }
  }

  const gpa = studentData.academic?.gpa;
  if (gpa !== null && gpa !== undefined) {
    if (gpa < t.gpaCritical) {
      academicRiskScore += 35;
      academicReasons.push(`Low cumulative GPA (${gpa}/10 is below minimum threshold ${t.gpaCritical})`);
    } else if (gpa < t.gpaWarning) {
      academicRiskScore += 20;
      academicReasons.push(`Marginal GPA (${gpa}/10 requires academic monitoring)`);
    }
  }

  const backlogs = studentData.academic?.backlogs || 0;
  if (backlogs >= t.backlogCritical) {
    academicRiskScore += 40;
    academicReasons.push(`Multiple active backlogs (${backlogs} subjects uncleared)`);
  } else if (backlogs >= t.backlogWarning) {
    academicRiskScore += 20;
    academicReasons.push(`Active backlog detected (${backlogs} subject requiring re-examination)`);
  }

  // Marks Trend Analysis across dated assessments
  let marksTrend = 'stable';
  const marksHistory = studentData.academic?.marksHistory || [];
  if (marksHistory.length >= 2) {
    const sortedMarks = [...marksHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latest = sortedMarks[sortedMarks.length - 1].percentage;
    const previous = sortedMarks[sortedMarks.length - 2].percentage;
    const diff = latest - previous;

    if (diff <= -12) {
      marksTrend = 'declining';
      academicRiskScore += 25;
      academicReasons.push(`Steep score decline of ${Math.abs(Math.round(diff))}% from previous semester`);
      academicEvidenceDates.push(new Date(sortedMarks[sortedMarks.length - 1].date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));
    } else if (diff >= 8) {
      marksTrend = 'improving';
      academicRiskScore = Math.max(0, academicRiskScore - 10);
    }
  }

  // LMS Inactivity check
  if (studentData.lms?.lastActiveDate) {
    const daysSinceActive = Math.round((Date.now() - new Date(studentData.lms.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive >= t.lmsInactivityDaysCritical) {
      academicRiskScore += 25;
      academicReasons.push(`Prolonged LMS inactivity (${daysSinceActive} days without login)`);
    } else if (daysSinceActive >= t.lmsInactivityDaysWarning) {
      academicRiskScore += 15;
      academicReasons.push(`LMS engagement lapse (${daysSinceActive} days since last access)`);
    }
  }

  let academicLevel = 'Low';
  if (academicRiskScore >= 60 || backlogs >= 2 || (att !== null && att < 60)) {
    academicLevel = 'Critical';
  } else if (academicRiskScore >= 40) {
    academicLevel = 'High';
  } else if (academicRiskScore >= 20) {
    academicLevel = 'Medium';
  }

  // ================= B. PLACEMENT READINESS RISK =================
  let placementRiskScore = 0;
  const placementReasons = [];
  const placementEvidenceDates = [];

  const coding = studentData.placement?.codingScore;
  if (coding !== null && coding !== undefined) {
    if (coding < t.codingCritical) {
      placementRiskScore += 40;
      placementReasons.push(`Low coding proficiency (${coding}/100 in benchmark coding rounds)`);
      placementEvidenceDates.push('Recent Placement Assessment');
    } else if (coding < t.codingWarning) {
      placementRiskScore += 25;
      placementReasons.push(`Coding assessment below corporate cutoff (${coding}/100)`);
    }
  } else {
    placementRiskScore += 15;
    placementReasons.push('Pending coding assessment benchmark');
  }

  const aptitude = studentData.placement?.aptitudeScore;
  if (aptitude !== null && aptitude !== undefined) {
    if (aptitude < t.aptitudeCritical) {
      placementRiskScore += 30;
      placementReasons.push(`Aptitude test score below hiring threshold (${aptitude}/100)`);
    } else if (aptitude < t.aptitudeWarning) {
      placementRiskScore += 15;
      placementReasons.push(`Moderate aptitude result (${aptitude}/100)`);
    }
  }

  const mockInterview = studentData.placement?.mockInterviewScore;
  if (mockInterview !== null && mockInterview !== undefined) {
    if (mockInterview < 50) {
      placementRiskScore += 25;
      placementReasons.push(`Mock interview evaluation scored ${mockInterview}/100 (needs technical communication prep)`);
    }
  }

  if (studentData.placement?.resumeReviewed === false) {
    placementRiskScore += 10;
    placementReasons.push('Resume verification milestone incomplete');
  }

  const milestonesDone = studentData.placement?.milestonesCompleted || 0;
  if (studentData.year >= 3 && milestonesDone < 2) {
    placementRiskScore += 20;
    placementReasons.push(`Placement track milestone deficit (Completed ${milestonesDone} of 5 milestones in Year ${studentData.year})`);
  }

  let placementLevel = 'Low';
  if (placementRiskScore >= 65 || (coding !== null && coding < 30)) {
    placementLevel = 'Critical';
  } else if (placementRiskScore >= 45) {
    placementLevel = 'High';
  } else if (placementRiskScore >= 20) {
    placementLevel = 'Medium';
  }

  // Priority Urgency Calculation (for Early-Warning Radar Ranking)
  const urgencyScore = Math.round(
    academicRiskScore * 0.55 +
    placementRiskScore * 0.35 +
    (marksTrend === 'declining' ? 20 : 0) +
    (backlogs * 10)
  );

  return {
    academicRisk: {
      level: academicLevel,
      score: academicRiskScore,
      reasons: academicReasons.length ? academicReasons : ['Academic performance within expected tolerances'],
      evidenceDates: academicEvidenceDates,
      trend: marksTrend,
    },
    placementRisk: {
      level: placementLevel,
      score: placementRiskScore,
      reasons: placementReasons.length ? placementReasons : ['Placement benchmarks meet or exceed targets'],
      evidenceDates: placementEvidenceDates,
      trend: coding !== null && coding >= 65 ? 'improving' : 'stable',
    },
    urgencyScore,
  };
}

/**
 * Computes Dynamic 4-Quadrant Student Segmentation
 * 
 * 1. High Performers: High Academic + High Placement
 * 2. Placement Focus: High Academic + Low Placement (strong academics, needs placement ramp-up)
 * 3. Academic Support: Low Academic + High Placement (talented coders, needs GPA rescue)
 * 4. Intensive Support: Low Academic + Low Placement (needs multidisciplinary intervention)
 */
function determineStudentSegment(studentData, scoringResult) {
  const academicContribution = scoringResult.scoreBreakdown?.academic?.normalized ?? (studentData.academic?.gpa ? studentData.academic.gpa * 10 : 50);
  const placementContribution = scoringResult.scoreBreakdown?.placement?.normalized ?? (studentData.placement?.codingScore ?? 50);

  const ACADEMIC_THRESHOLD = 70;
  const PLACEMENT_THRESHOLD = 60;

  const isAcademicHigh = academicContribution >= ACADEMIC_THRESHOLD;
  const isPlacementHigh = placementContribution >= PLACEMENT_THRESHOLD;

  if (isAcademicHigh && isPlacementHigh) {
    return 'High Performers';
  } else if (isAcademicHigh && !isPlacementHigh) {
    return 'Placement Focus';
  } else if (!isAcademicHigh && isPlacementHigh) {
    return 'Academic Support';
  } else {
    return 'Intensive Support';
  }
}

/**
 * Fully process a student record with scoring, dual-risk, and segmentation
 */
function processStudentRecord(studentData, customWeights = {}, customThresholds = {}) {
  const scoring = calculateStudentSuccessScore(studentData, customWeights);
  const dualRisk = evaluateDualRisk(studentData, customThresholds);
  const segment = determineStudentSegment(studentData, scoring);

  return {
    ...scoring,
    ...dualRisk,
    segment,
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  normalizeScore,
  calculateStudentSuccessScore,
  evaluateDualRisk,
  determineStudentSegment,
  processStudentRecord,
};
