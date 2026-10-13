/**
 * CampusIQ AI Student Success Copilot & Reminders Automated Verification Suite
 * Validates Copilot Personas, Attendance Math, Work Planner, and Persistent Reminders
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

async function runCopilotTests() {
  console.log('====================================================');
  console.log('🤖  RUNNING CAMPUSIQ AI STUDENT SUCCESS COPILOT TESTS');
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
    // 1. Authenticate Personas
    const stuLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'student.aarav@campus.edu.in',
      password: 'Student@123',
    });
    assert(stuLogin.status === 200 && stuLogin.data.token, 'Student authentication successful (Aarav Sharma)');
    const studentToken = stuLogin.data.token;

    const facLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'faculty.cse@campus.edu.in',
      password: 'Faculty@123',
    });
    assert(facLogin.status === 200 && facLogin.data.token, 'Faculty authentication successful (Dr. S. Sharma)');
    const facultyToken = facLogin.data.token;

    const admLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@campus.edu.in',
      password: 'Admin@123',
    });
    assert(admLogin.status === 200 && admLogin.data.token, 'Admin authentication successful');
    const adminToken = admLogin.data.token;

    // ------------------------------------------------------------------
    // SCENARIO 1: STUDENT AI COPILOT
    // ------------------------------------------------------------------
    console.log('\n--- Scenario 1: Student AI Copilot ---');
    
    // Performance Analysis
    const stuAnalysis = await makeRequest('POST', '/api/ai/chat', {
      message: 'Analyze my current academic performance',
    }, studentToken);
    assert(stuAnalysis.status === 200, 'Student Copilot analysis returned HTTP 200');
    assert(stuAnalysis.data.reply.includes('Student Success Score'), 'Student Copilot provides transparent SSS breakdown');
    assert(stuAnalysis.data.metricCards && stuAnalysis.data.metricCards.length >= 3, 'Student Copilot returns structured metric cards');
    assert(stuAnalysis.data.quickActions && stuAnalysis.data.quickActions.length >= 1, 'Student Copilot includes actionable navigation deep links');

    // Attendance Recovery Calculator
    const stuAtt = await makeRequest('POST', '/api/ai/chat', {
      message: 'How many classes do I need to reach 75% attendance?',
    }, studentToken);
    assert(stuAtt.status === 200, 'Attendance calculator returned HTTP 200');
    assert(stuAtt.data.reply.includes('Attendance') && stuAtt.data.reply.includes('75'), 'Attendance recovery calculates consecutive classes needed');

    // 30-Day Placement Sprint
    const stuSprint = await makeRequest('POST', '/api/ai/chat', {
      message: 'Create a 30-day placement preparation plan',
    }, studentToken);
    assert(stuSprint.status === 200, 'Placement sprint request returned HTTP 200');
    assert(stuSprint.data.reply.includes('Placement Sprint') && stuSprint.data.reply.includes('Week 1'), 'Generated week-by-week placement roadmap');

    // Strict Privacy Isolation: Student A cannot inspect Student B
    const stuPrivacy = await makeRequest('POST', '/api/ai/chat', {
      message: 'Show performance metrics and attendance for STU2026-004',
    }, studentToken);
    assert(stuPrivacy.status === 200, 'Cross-student query handled gracefully');
    assert(stuPrivacy.data.reply.includes('Access Denied') && stuPrivacy.data.reply.includes('FERPA'), 'Horizontal privilege escalation blocked with privacy violation alert');

    // ------------------------------------------------------------------
    // SCENARIO 2: FACULTY AI WORK ASSISTANT
    // ------------------------------------------------------------------
    console.log('\n--- Scenario 2: Faculty AI Work Assistant ---');

    // Daily Work Planner
    const facPlanner = await makeRequest('POST', '/api/ai/chat', {
      message: 'What are my priority tasks today? (Work Planner)',
    }, facultyToken);
    assert(facPlanner.status === 200, 'Faculty Work Planner returned HTTP 200');
    assert(facPlanner.data.reply.includes('Daily Work Planner'), 'Daily Work Planner synthesized successfully');
    assert(facPlanner.data.reply.includes('Urgent Student Interventions'), 'Work Planner includes categorized urgent interventions');
    assert(facPlanner.data.metricCards && facPlanner.data.metricCards.length >= 3, 'Work Planner includes cohort metric cards');

    // Attendance Below 75% Alerts
    const facAttAlert = await makeRequest('POST', '/api/ai/chat', {
      message: 'Which students have attendance below 75%?',
    }, facultyToken);
    assert(facAttAlert.status === 200, 'Attendance drift query returned HTTP 200');
    assert(facAttAlert.data.reply.includes('Below 75%'), 'Identified students below 75% attendance cutoff');

    // Natural Language Reminder Creation
    const facReminder = await makeRequest('POST', '/api/ai/chat', {
      message: 'Remind me Friday to follow up with coding assessment defaulters',
    }, facultyToken);
    assert(facReminder.status === 200, 'Natural language reminder returned HTTP 200');
    assert(facReminder.data.reply.includes('Persistent Reminder Created'), 'AI parsed and confirmed persistent reminder');
    assert(facReminder.data.createdReminder && facReminder.data.createdReminder.title.includes('coding assessment defaulters'), 'Created reminder object attached with correct title');

    // Weekly Progress Summary
    const facWeekly = await makeRequest('POST', '/api/ai/chat', {
      message: 'Prepare a weekly student progress report for my assigned class',
    }, facultyToken);
    assert(facWeekly.status === 200, 'Weekly progress report returned HTTP 200');
    assert(facWeekly.data.reply.includes('Weekly Cohort Progress Summary'), 'Generated cohort progress report');

    // ------------------------------------------------------------------
    // SCENARIO 3: PERSISTENT REMINDERS REST API
    // ------------------------------------------------------------------
    console.log('\n--- Scenario 3: Persistent Reminders REST API ---');

    // GET Reminders
    const getRem = await makeRequest('GET', '/api/reminders', null, facultyToken);
    assert(getRem.status === 200, 'GET /api/reminders returned HTTP 200');
    assert(Array.isArray(getRem.data.reminders) && getRem.data.reminders.length > 0, 'Fetched active reminders for faculty');

    // POST Reminder
    const createRem = await makeRequest('POST', '/api/reminders', {
      title: 'Review Midterm Data Structures Notes',
      category: 'academic',
      priority: 'high',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    }, studentToken);
    assert(createRem.status === 201, 'POST /api/reminders created reminder successfully');
    const createdId = createRem.data.reminder._id || createRem.data.reminder.id;

    // PATCH Toggle Reminder
    const toggleRem = await makeRequest('PATCH', `/api/reminders/${createdId}/toggle`, null, studentToken);
    assert(toggleRem.status === 200, 'PATCH /api/reminders/:id/toggle returned HTTP 200');
    assert(toggleRem.data.reminder.isCompleted === true, 'Reminder marked as completed');

    // DELETE Reminder
    const delRem = await makeRequest('DELETE', `/api/reminders/${createdId}`, null, studentToken);
    assert(delRem.status === 200, 'DELETE /api/reminders/:id deleted reminder');

    // ------------------------------------------------------------------
    // SCENARIO 4: ADMINISTRATOR AI DECISION ASSISTANT
    // ------------------------------------------------------------------
    console.log('\n--- Scenario 4: Administrator AI Decision Assistant ---');

    // High Risk Distribution
    const admRisk = await makeRequest('POST', '/api/ai/chat', {
      message: 'What percentage of students are currently classified as high risk?',
    }, adminToken);
    assert(admRisk.status === 200, 'Admin risk distribution returned HTTP 200');
    assert(admRisk.data.reply.includes('Institutional Risk Distribution Analysis'), 'Campus-wide risk distribution calculated');

    // Cross-Department Benchmark
    const admDept = await makeRequest('POST', '/api/ai/chat', {
      message: 'Which departments need additional academic support?',
    }, adminToken);
    assert(admDept.status === 200, 'Admin department comparison returned HTTP 200');
    assert(admDept.data.reply.includes('Cross-Department'), 'Department benchmark synthesized');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCopilotTests();
