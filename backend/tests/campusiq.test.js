const http = require('http');

const BASE_URL = 'http://localhost:5000';

let authToken = null;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runCampusIQTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING CAMPUSIQ SMART ANALYTICS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Authenticate as Institutional Admin
    console.log('[Auth] Authenticating as Institutional Admin...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@campus.edu.in',
      password: 'Admin@123',
    });
    if (loginRes.data?.token) {
      authToken = loginRes.data.token;
      console.log('  ✓ PASS: Successfully obtained Admin Bearer token\n');
    } else {
      console.error('  ✗ FAIL: Admin authentication failed:', loginRes.data);
    }

    // Test 1: Campus Analytics Overview
    console.log('[1/11] Testing GET /api/campusiq/analytics');
    const analytics = await makeRequest('GET', '/api/campusiq/analytics');
    assert(analytics.status === 200, 'Analytics returns HTTP 200');
    assert(analytics.data.summary?.totalStudents === 200, 'Benchmark contains exactly 200 students');
    assert(analytics.data.summary?.averageSuccessScore > 0, 'Computes non-zero average success score');
    assert(Object.keys(analytics.data.distributions?.segments || {}).length === 4, 'Includes 4-quadrant segment distributions');

    // Test 2: Student Directory
    console.log('\n[2/11] Testing GET /api/campusiq/students (Pagination & Filters)');
    const studentsRes = await makeRequest('GET', '/api/campusiq/students?page=1&limit=10&department=CSE');
    assert(studentsRes.status === 200, 'Students directory returns HTTP 200');
    assert(studentsRes.data.students?.length === 10, 'Respects pagination limit=10');
    assert(studentsRes.data.students.every((s) => s.department === 'Computer Science & Engineering'), 'Accurately filters department=CSE to Computer Science & Engineering');

    // Test 3: Single Student Profile
    const testStudentId = studentsRes.data.students[0].studentId;
    console.log(`\n[3/11] Testing GET /api/campusiq/students/${testStudentId}`);
    const profileRes = await makeRequest('GET', `/api/campusiq/students/${testStudentId}`);
    assert(profileRes.status === 200, 'Single student profile returns HTTP 200');
    assert(profileRes.data.student?.studentId === testStudentId, 'Returns correct target student');
    assert(profileRes.data.student?.computed?.scoreBreakdown !== undefined, 'Contains full score breakdown');
    assert(Array.isArray(profileRes.data.student?.computed?.academicRisk?.reasons), 'Academic risk contains reasons list');

    // Test 4: Early-Warning Priority Queue
    console.log('\n[4/11] Testing GET /api/campusiq/at-risk (Radar Queue)');
    const atRiskRes = await makeRequest('GET', '/api/campusiq/at-risk');
    assert(atRiskRes.status === 200, 'At-risk radar returns HTTP 200');
    assert(atRiskRes.data.queue?.length > 0, 'Finds at-risk students in priority queue');
    const q = atRiskRes.data.queue;
    let isSorted = true;
    for (let i = 0; i < q.length - 1; i++) {
      if ((q[i].urgencyScore || 0) < (q[i + 1].urgencyScore || 0)) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Queue is sorted by Urgency Score in descending order');

    // Test 5: Alert Review & Audit
    console.log('\n[5/11] Testing POST /api/campusiq/at-risk/review');
    const reviewRes = await makeRequest('POST', '/api/campusiq/at-risk/review', {
      studentId: testStudentId,
      reviewStatus: 'Under Review',
      reviewNotes: 'Faculty assigned to investigate attendance drops',
      reviewerName: 'Prof. Test Reviewer',
    });
    if (reviewRes.status !== 200) {
      console.log('Review Error details:', reviewRes.status, reviewRes.data);
    }
    assert(reviewRes.status === 200, 'Alert review returns HTTP 200');
    assert(reviewRes.data?.audit?.reviewStatus === 'Under Review', 'Review status updated');

    // Test 6: 4-Quadrant Segmentation
    console.log('\n[6/11] Testing GET /api/campusiq/segments');
    const segmentsRes = await makeRequest('GET', '/api/campusiq/segments');
    assert(segmentsRes.status === 200, 'Segments overview returns HTTP 200');
    assert(segmentsRes.data.segments?.length === 4, 'Returns all 4 strategic quadrants');
    const highPerf = segmentsRes.data.segments.find((s) => s.segmentName === 'High Performers');
    assert(highPerf && highPerf.recommendedPrograms?.length > 0, 'Quadrant includes institutional programs');

    // Test 7: What-If Scenario Simulator
    console.log('\n[7/11] Testing POST /api/campusiq/simulate');
    const simRes = await makeRequest('POST', '/api/campusiq/simulate', {
      studentId: testStudentId,
      hypotheticalChanges: {
        attendancePercentage: 90,
        codingScore: 80,
      },
    });
    assert(simRes.status === 200, 'Simulation returns HTTP 200');
    assert(simRes.data.scenario?.successScore !== undefined, 'Simulation projects hypothetical score');
    assert(simRes.data.delta?.contributors?.length > 0, 'Simulation returns contributing drivers');

    // Test 8: Interventions Action Intelligence
    console.log('\n[8/11] Testing POST & PATCH /api/campusiq/interventions');
    const createInvRes = await makeRequest('POST', '/api/campusiq/interventions', {
      studentId: testStudentId,
      concernTitle: 'Automated Test Remedial Tutorial',
      actionCategory: 'Academic Remedial',
      recommendedAction: '3x Weekly DSA Mentorship Sessions',
      priority: 'High',
      mentorAssigned: 'Dr. Automation Tester',
    });
    assert(createInvRes.status === 201, 'Creates new intervention with HTTP 201');
    const invId = createInvRes.data.intervention?.interventionId;

    const patchInvRes = await makeRequest('PATCH', `/api/campusiq/interventions/${invId}`, {
      status: 'Completed',
      note: 'Remedial completed with significant performance boost',
      followUpIndicators: {
        attendance: 88,
        codingScore: 75,
        successScore: 82,
      },
    });
    assert(patchInvRes.status === 200, 'Updates intervention with HTTP 200');
    assert(patchInvRes.data.intervention?.observedChanges?.qualitativeSummary !== undefined, 'Calculates observed before-and-after outcome');

    // Test 9: Data Hub History & Validation
    console.log('\n[9/11] Testing POST /api/campusiq/data-hub/upload');
    const uploadRes = await makeRequest('POST', '/api/campusiq/data-hub/upload', {
      datasetCategory: 'Attendance',
      fileName: 'test_attendance.csv',
      csvContent: `student_id,attendance_percentage\n${testStudentId},92\nINVALID-STU-999,80`,
    });
    assert(uploadRes.status === 200, 'Upload returns HTTP 200');
    assert(uploadRes.data.summary?.successfulRows === 1, 'Accepts 1 valid matched student row');
    assert(uploadRes.data.summary?.rejectedRows === 1, 'Rejects 1 unmatched student row');

    // Test 10: Reports Export
    console.log('\n[10/11] Testing GET /api/campusiq/reports/export');
    const exportRes = await makeRequest('GET', '/api/campusiq/reports/export?type=risk-register');
    assert(exportRes.status === 200, 'CSV export returns HTTP 200');
    assert(exportRes.headers['content-type']?.includes('text/csv'), 'Content-Type header is text/csv');
    assert(exportRes.raw?.includes('Student ID'), 'CSV content contains column headers');

    // Test 11: Benchmark Reset
    console.log('\n[11/11] Testing POST /api/campusiq/data-hub/reset-demo');
    const resetRes = await makeRequest('POST', '/api/campusiq/data-hub/reset-demo');
    assert(resetRes.status === 200, 'Benchmark reset returns HTTP 200');
    assert(resetRes.data.studentCount === 200, 'Restores 200 clean student records');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

runCampusIQTests();
