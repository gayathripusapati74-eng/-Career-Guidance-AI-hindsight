/**
 * Comprehensive Automated Security & Role-Based Authorization Test Suite
 * Validates all 10 Security Scenarios for KPMG CampusIQ Upgrade
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

async function runSecurityTests() {
  console.log('====================================================');
  console.log('🛡️  RUNNING CAMPUSIQ ENTERPRISE SECURITY & RBAC TESTS');
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
    // 0. Authenticate users
    console.log('[Setup] Authenticating test personas...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@campus.edu.in',
      password: 'Admin@123',
    });
    const adminToken = adminLogin.data.token;
    assert(adminToken && adminLogin.data.user.role === 'admin', 'Admin authenticated with server-verified role: admin');

    const facultyLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'faculty.cse@campus.edu.in',
      password: 'Faculty@123',
    });
    const facultyToken = facultyLogin.data.token;
    assert(facultyToken && facultyLogin.data.user.role === 'faculty', 'Faculty authenticated with server-verified role: faculty');

    const studentALogin = await makeRequest('POST', '/api/auth/login', {
      email: 'student.aarav@campus.edu.in',
      password: 'Student@123',
    });
    const studentAToken = studentALogin.data.token;
    assert(studentAToken && studentALogin.data.user.role === 'student', 'Student A authenticated with server-verified role: student (STU2026-001)');

    const studentBLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'student.sneha@campus.edu.in',
      password: 'Student@123',
    });
    const studentBToken = studentBLogin.data.token;
    assert(studentBToken && studentBLogin.data.user.role === 'student', 'Student B authenticated with server-verified role: student (STU2026-004)');

    // Test 1: Admin can access Admin pages and authorized administrative APIs
    console.log('\n[Scenario 1] Admin access to administrative APIs');
    const adminAnalytics = await makeRequest('GET', '/api/campusiq/analytics', null, adminToken);
    assert(adminAnalytics.status === 200, 'Admin can access campus analytics (HTTP 200)');

    const adminExport = await makeRequest('GET', '/api/campusiq/reports/export?type=risk-register', null, adminToken);
    assert(adminExport.status === 200, 'Admin can export institutional CSV reports (HTTP 200)');

    const adminReset = await makeRequest('POST', '/api/campusiq/data-hub/reset-demo', {}, adminToken);
    assert(adminReset.status === 200, 'Admin can trigger Data Hub reset (HTTP 200)');

    // Test 2: Faculty cannot access Admin-only APIs
    console.log('\n[Scenario 2] Faculty blocked from Admin-only APIs');
    const facultyExport = await makeRequest('GET', '/api/campusiq/reports/export', null, facultyToken);
    assert(facultyExport.status === 403, 'Faculty blocked from exporting reports (HTTP 403 Forbidden)');

    const facultyReset = await makeRequest('POST', '/api/campusiq/data-hub/reset-demo', {}, facultyToken);
    assert(facultyReset.status === 403, 'Faculty blocked from Data Hub administrative reset (HTTP 403 Forbidden)');

    // Test 3: Student cannot access Admin or Faculty-only APIs
    console.log('\n[Scenario 3] Student blocked from Admin & Faculty APIs');
    const studentAnalytics = await makeRequest('GET', '/api/campusiq/analytics', null, studentAToken);
    assert(studentAnalytics.status === 403, 'Student blocked from institutional analytics (HTTP 403 Forbidden)');

    const studentAtRisk = await makeRequest('GET', '/api/campusiq/at-risk', null, studentAToken);
    assert(studentAtRisk.status === 403, 'Student blocked from early-warning risk queue (HTTP 403 Forbidden)');

    const studentCreateInt = await makeRequest('POST', '/api/campusiq/interventions', {
      studentId: 'STU2026-004',
      concernTitle: 'Unauthorized Attempt',
      recommendedAction: 'Testing',
      actionCategory: 'Academic',
    }, studentAToken);
    assert(studentCreateInt.status === 403, 'Student blocked from creating interventions (HTTP 403 Forbidden)');

    // Test 4: Horizontal Privilege Escalation Prevention
    console.log('\n[Scenario 4] Horizontal Privilege Escalation (Student A querying Student B)');
    const studentAViewingOwn = await makeRequest('GET', '/api/campusiq/students/STU2026-001', null, studentAToken);
    assert(studentAViewingOwn.status === 200, 'Student A can view own profile STU2026-001 (HTTP 200)');

    const studentAViewingB = await makeRequest('GET', '/api/campusiq/students/STU2026-004', null, studentAToken);
    assert(studentAViewingB.status === 403, 'Student A BLOCKED from viewing Student B STU2026-004 (HTTP 403 Forbidden)');

    // Test 5: Self-Role Escalation Prevention
    console.log('\n[Scenario 5] Self-Role Escalation Prevention');
    const escalateAttempt = await makeRequest('PUT', '/api/auth/profile', {
      role: 'admin',
      studentId: 'HACKED-ID',
      careerGoal: 'Cloud Architect',
    }, studentAToken);
    assert(escalateAttempt.status === 200, 'Profile update processed safely (HTTP 200)');
    
    // Verify role remained student on server
    const verifyMe = await makeRequest('GET', '/api/auth/me', null, studentAToken);
    assert(verifyMe.data.user.role === 'student', 'Server rejected role tampering; role strictly remained "student"');
    assert(verifyMe.data.user.studentId === 'STU2026-001', 'Server rejected studentId tampering; preserved original ID');

    // Test 6: Unauthenticated API Requests Rejected
    console.log('\n[Scenario 6] Unauthenticated API requests rejected');
    const unauthAnalytics = await makeRequest('GET', '/api/campusiq/analytics', null, null);
    assert(unauthAnalytics.status === 401, 'Unauthenticated request to /api/campusiq/analytics returned HTTP 401');

    const unauthStudents = await makeRequest('GET', '/api/campusiq/students', null, null);
    assert(unauthStudents.status === 401, 'Unauthenticated request to /api/campusiq/students returned HTTP 401');

    // Test 7: Student Safe Self-Endpoints
    console.log('\n[Scenario 7] Student authorized self-endpoints');
    const studentMe = await makeRequest('GET', '/api/campusiq/student/me', null, studentAToken);
    assert(studentMe.status === 200 && studentMe.data.student.studentId === 'STU2026-001', 'Student can access /api/campusiq/student/me');

    const studentDashboard = await makeRequest('GET', '/api/campusiq/student/dashboard', null, studentAToken);
    assert(studentDashboard.status === 200 && studentDashboard.data.recommendations.length > 0, 'Student can access /api/campusiq/student/dashboard with supportive recommendations');

    // Test 8: Faculty Scoped Dashboard
    console.log('\n[Scenario 8] Faculty scoped dashboard');
    const facultyDashboard = await makeRequest('GET', '/api/campusiq/faculty/dashboard', null, facultyToken);
    assert(facultyDashboard.status === 200, 'Faculty can access /api/campusiq/faculty/dashboard');
    assert(facultyDashboard.data.facultyProfile.department === 'Computer Science & Engineering', 'Faculty dashboard scoped to CSE department');

    // Test 9: Logout Invalidates Session
    console.log('\n[Scenario 9] Logout session invalidation');
    // Login temporary user to test logout revocation
    const tempLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'student.sneha@campus.edu.in',
      password: 'Student@123',
    });
    const tempToken = tempLogin.data.token;
    
    // Call logout endpoint
    const logoutRes = await makeRequest('POST', '/api/auth/logout', {}, tempToken);
    assert(logoutRes.status === 200, 'Logout returned HTTP 200 and invalidated token');

    // Try accessing protected route with revoked token
    const afterLogout = await makeRequest('GET', '/api/auth/me', null, tempToken);
    assert(afterLogout.status === 401, 'Revoked token rejected with HTTP 401 Unauthorized');

    // Test 10: Data Export Authorization Enforcement
    console.log('\n[Scenario 10] Data export authorization enforcement');
    const studentExport = await makeRequest('GET', '/api/campusiq/reports/export', null, studentAToken);
    assert(studentExport.status === 403, 'Student blocked from CSV report export (HTTP 403 Forbidden)');

    console.log('\n====================================================');
    console.log(`🛡️  SECURITY SUITE RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runSecurityTests();
