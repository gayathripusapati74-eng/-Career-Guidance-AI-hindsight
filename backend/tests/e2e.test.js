/**
 * End-to-End API Integration Test Suite
 * Tests all endpoints: Auth, Skills, Resume, Roadmap, Quiz, Interview, Jobs, Progress, Memory, Status, and Chat
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: '127.0.0.1',
      port: 5000,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
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

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CAREER GUIDANCE AI INTEGRATION TESTS');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Status
    console.log('\n[1. System Status Probe]');
    const statusRes = await request('GET', '/api/status');
    assert(statusRes.status === 200, 'GET /api/status returns HTTP 200');
    assert(statusRes.body?.services?.mongodb !== undefined, 'MongoDB status probed');
    assert(statusRes.body?.services?.ai !== undefined, 'AI API status probed');
    assert(statusRes.body?.services?.hindsight !== undefined, 'Hindsight status probed');

    // 2. Auth Registration
    console.log('\n[2. Authentication Flow]');
    const testEmail = `test.dev.${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      firstName: 'Alex',
      lastName: 'Hacker',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      careerGoal: 'Full Stack Developer',
      experienceLevel: 'beginner',
    });
    assert(regRes.status === 201 && regRes.body?.success, 'POST /api/auth/register registers candidate');
    const token = regRes.body?.token;
    assert(Boolean(token), 'JWT Token generated on registration');

    // 3. Auth Me
    const meRes = await request('GET', '/api/auth/me', null, token);
    assert(meRes.status === 200 && meRes.body?.user?.email === testEmail, 'GET /api/auth/me returns candidate profile');

    // 4. Skills Assessment
    console.log('\n[3. Skills Assessment Module]');
    const assessRes = await request(
      'POST',
      '/api/skills/assessment',
      {
        skills: [
          { skill: 'React', score: 75 },
          { skill: 'JavaScript', score: 68 },
          { skill: 'SQL', score: 42 },
          { skill: 'Node.js', score: 70 },
        ],
      },
      token
    );
    assert(assessRes.status === 201 && assessRes.body?.success, 'POST /api/skills/assessment records scores');
    assert(assessRes.body?.assessment?.overallScore === 64, 'Computed correct overall score');

    const histRes = await request('GET', '/api/skills/history', null, token);
    assert(histRes.status === 200 && histRes.body?.history?.length > 0, 'GET /api/skills/history retrieves history');

    // 5. Resume Evaluation
    console.log('\n[4. Resume Evaluation Module]');
    const resumeRes = await request(
      'POST',
      '/api/resume/evaluate',
      {
        resumeText:
          'Alex Hacker. Full Stack Engineer. Experience with JavaScript, React, Node.js, Express, MongoDB. Built portfolio apps.',
      },
      token
    );
    assert(resumeRes.status === 201 && resumeRes.body?.success, 'POST /api/resume/evaluate evaluates ATS compatibility');
    assert(resumeRes.body?.evaluation?.atsScore > 50, 'Computed valid ATS score');

    // 6. Career Roadmap
    console.log('\n[5. Personalized Career Roadmap]');
    const roadRes = await request('POST', '/api/career/roadmap', { goal: 'Full Stack Developer' }, token);
    assert(roadRes.status === 201 && roadRes.body?.plan?.phases?.length === 6, 'POST /api/career/roadmap generates 6 phases');

    const phaseRes = await request(
      'PUT',
      '/api/career/roadmap/phase',
      { phaseNumber: 1, status: 'completed' },
      token
    );
    assert(phaseRes.status === 200 && phaseRes.body?.plan?.overallProgress > 0, 'PUT /api/career/roadmap/phase updates progress');

    // 7. AI Quiz
    console.log('\n[6. Adaptive AI Quiz]');
    const quizGenRes = await request('POST', '/api/quiz/generate', { skill: 'JavaScript', level: 'intermediate' }, token);
    assert(quizGenRes.status === 200 && quizGenRes.body?.questions?.length === 5, 'POST /api/quiz/generate generates 5 questions');

    const firstQ = quizGenRes.body.questions[0];
    const quizSubRes = await request(
      'POST',
      '/api/quiz/result',
      {
        skill: 'JavaScript',
        level: 'intermediate',
        answers: [
          {
            question: firstQ.question,
            userAnswer: firstQ.correctAnswer,
            correctAnswer: firstQ.correctAnswer,
            explanation: firstQ.explanation,
          },
        ],
      },
      token
    );
    assert(quizSubRes.status === 201 && quizSubRes.body?.result?.percentage === 100, 'POST /api/quiz/result scores quiz correctly');

    // 8. Mock Interview
    console.log('\n[7. Mock Interview Simulator]');
    const intStartRes = await request(
      'POST',
      '/api/interview/start',
      { role: 'Full Stack Developer', experienceLevel: 'Junior', interviewType: 'Technical' },
      token
    );
    assert(intStartRes.status === 201 && intStartRes.body?.sessionId, 'POST /api/interview/start creates interview session');

    const intAnsRes = await request(
      'POST',
      '/api/interview/answer',
      {
        sessionId: intStartRes.body.sessionId,
        questionNumber: 1,
        answer: 'React reconciliation compares virtual DOM trees to compute efficient mutation patches using component keys.',
      },
      token
    );
    assert(intAnsRes.status === 200 && intAnsRes.body?.evaluation?.score > 60, 'POST /api/interview/answer evaluates candidate answer');

    // 9. Job Recommendations
    console.log('\n[8. Job Matches]');
    const jobsRes = await request('GET', '/api/jobs', null, token);
    assert(jobsRes.status === 200 && jobsRes.body?.jobs?.length > 0, 'GET /api/jobs returns jobs with match scores');
    assert(jobsRes.body?.isDemoData === true, 'Jobs clearly tagged as DEMO data');

    // 10. Progress Dashboard
    console.log('\n[9. Progress & Reflect]');
    const progRes = await request('GET', '/api/progress', null, token);
    assert(progRes.status === 200 && progRes.body?.stats?.overallReadiness > 0, 'GET /api/progress computes aggregated readiness');

    // 11. AI Career Chat
    console.log('\n[10. AI Career Chat with Hindsight Flow]');
    const chatRes = await request(
      'POST',
      '/api/ai/chat',
      { message: 'What should I learn next based on my assessments?' },
      token
    );
    assert(chatRes.status === 200 && Boolean(chatRes.body?.reply), 'POST /api/ai/chat returns personalized mentor answer');
    assert(chatRes.body?.reply?.length > 50, 'Response contains rich actionable guidance');

    console.log('\n====================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Start server and wait until port is ready
require('../server');
setTimeout(runTests, 4000);
