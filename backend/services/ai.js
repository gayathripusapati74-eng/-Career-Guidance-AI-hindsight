/**
 * AI Service for Career Guidance AI
 * Integrates with LLMs (Google Gemini or OpenAI API)
 * Seamlessly consumes recalled Hindsight memories to personalize every response
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const AI_API_KEY = process.env.AI_API_KEY ? process.env.AI_API_KEY.trim() : '';
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-flash';

const isAiConfigured = Boolean(AI_API_KEY && AI_API_KEY.length > 5);

let geminiModel = null;
if (isAiConfigured && AI_PROVIDER === 'gemini') {
  try {
    const genAI = new GoogleGenerativeAI(AI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: AI_MODEL });
    console.log(`[AI Service] Configured Gemini with model: ${AI_MODEL}`);
  } catch (err) {
    console.error('[AI Service] Failed to initialize Gemini model:', err.message);
  }
}

/**
 * Check AI status
 */
function getAiStatus() {
  return {
    configured: isAiConfigured,
    provider: AI_PROVIDER,
    model: AI_MODEL,
    message: isAiConfigured
      ? `AI LLM active via ${AI_PROVIDER} (${AI_MODEL})`
      : 'AI_API_KEY is not configured in backend/.env. Using intelligent expert fallback engines.',
  };
}

/**
 * Helper to call Gemini model safely
 */
async function callLlm(prompt, fallbackGenerator) {
  if (isAiConfigured && geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      return { text, liveLlm: true };
    } catch (err) {
      console.warn('[AI Service] Gemini call failed, falling back to expert engine:', err.message);
      return { text: fallbackGenerator(), liveLlm: false, warning: err.message };
    }
  }
  return { text: fallbackGenerator(), liveLlm: false };
}

/**
 * 1. AI Career Mentor Chat
 * Injects recalled Hindsight memories directly into context for hyper-personalized guidance
 */
async function generateCareerChatResponse({ message, user, memories = [], history = [] }) {
  const memoryContext =
    memories.length > 0
      ? `RECALLED LONG-TERM MEMORIES FROM HINDSIGHT FOR THIS USER:\n` +
        memories.map((m, i) => `${i + 1}. ${m.text || m}`).join('\n')
      : `No prior memories stored yet in Hindsight for this user. This is a fresh session.`;

  const userProfileContext = `
USER PROFILE:
- Name: ${user.firstName} ${user.lastName}
- Career Goal: ${user.careerGoal || 'Full Stack Developer'}
- Target Role: ${user.targetRole || 'Software Engineer'}
- Current Experience Level: ${user.experienceLevel || 'Beginner'}
- Known Skills: ${(user.currentSkills || []).map((s) => `${s.name} (${s.level || 'beginner'})`).join(', ') || 'Not yet assessed'}
`;

  const prompt = `
You are the Career Guidance AI Mentor — an elite career coach and technical architect.
Your role is to guide the user with highly specific, encouraging, actionable, and personalized advice.

${userProfileContext}

${memoryContext}

CONVERSATION HISTORY:
${history.slice(-4).map((h) => `${h.sender === 'user' ? 'User' : 'Mentor'}: ${h.text}`).join('\n')}

USER'S LATEST MESSAGE:
"${message}"

INSTRUCTIONS:
1. Always reference relevant details from the recalled Hindsight memories (e.g. past scores, goals, weak topics, or roadmap progress) so the user knows you remember their trajectory.
2. If the user asks what to learn next or how to improve, pinpoint their exact weak spots recorded in their memory.
3. Keep the answer structured with clear headings, bullet points, and actionable next steps.
4. Conclude with an encouraging question or recommended immediate action.
`;

  const fallbackGenerator = () => {
    const goal = user.careerGoal || 'Full Stack Developer';
    const weakList = (user.currentSkills || [])
      .filter((s) => s.score < 60)
      .map((s) => s.name);

    let memoryNotes = '';
    if (memories.length > 0) {
      memoryNotes = `\n\n📌 **Context Recalled from Your Hindsight Memory Bank:**\n` +
        memories.slice(0, 3).map((m) => `• ${m.text || m}`).join('\n');
    }

    if (message.toLowerCase().includes('what should i learn next') || message.toLowerCase().includes('learn next')) {
      const topPriority = weakList.length > 0 ? weakList[0] : 'Advanced Database Indexing & SQL';
      return `### 🎯 Recommended Next Learning Steps for ${goal}

Based on your current learning trajectory and past assessments, here is your prioritized focus:

1. **Top Priority: ${topPriority}**
   - Solidify core concepts (schema design, indexing, queries).
   - Complete 3 practical exercises this week.
2. **Reinforce Core Full-Stack Integration:**
   - Connect your frontend state management with RESTful API endpoints.
   - Practice error handling and validation middleware.
3. **Weekly Milestone:**
   - Build a mini-project applying ${topPriority} to prepare for your mock technical interviews.${memoryNotes}

*Would you like me to generate a 5-question quiz to test your proficiency in ${topPriority}?*`;
    }

    if (message.toLowerCase().includes('improved') || message.toLowerCase().includes('progress')) {
      return `### 📈 Your Growth & Improvement Analysis

Reviewing your journey towards becoming a **${goal}**:

- **Foundations Established:** You have engaged with multiple assessments and established clear career goals.
- **Skill Retention:** Your activity demonstrates commitment to technical mastery.
- **Next Frontier:** Continue closing gaps in backend architecture and testing.${memoryNotes}

*Keep this momentum going! What topic would you like to drill next?*`;
    }

    return `### 💡 Career Guidance & Strategy

Hello **${user.firstName}**! As you work toward your goal of becoming a **${goal}**:

1. **Strategic Skill Building:**
   Focus on practical, hands-on building rather than passive reading. Every concept you learn should be cemented in a GitHub repo.
2. **Current Trajectory:**
   Ensure you align your daily practice with the steps defined in your Career Roadmap.
3. **Assessment Checkpoint:**
   Regularly take our Skill Assessments and Quizzes so Hindsight can track your evolving strengths and weaknesses.${memoryNotes}

How can I help you today? We can dive into roadmap phases, mock interview prep, or resume ATS optimization!`;
  };

  const response = await callLlm(prompt, fallbackGenerator);
  return {
    reply: response.text,
    memoriesUsed: memories.length,
    liveLlm: response.liveLlm,
  };
}

/**
 * 2. Generate Adaptive Quiz Questions
 */
async function generateQuizQuestions({ skill, level = 'beginner' }) {
  const prompt = `
Generate 5 high-quality, practical multiple-choice quiz questions for:
Skill: "${skill}"
Level: "${level}"

Return ONLY a valid JSON array of 5 objects with this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why Option A is correct",
    "topic": "Specific subtopic"
  }
]
`;

  const fallbackQuestions = getFallbackQuizQuestions(skill, level);

  if (isAiConfigured && geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Failed to parse LLM quiz JSON, using curated questions:', err.message);
    }
  }

  return fallbackQuestions;
}

/**
 * Fallback questions for common skills
 */
function getFallbackQuizQuestions(skill = 'JavaScript', level = 'intermediate') {
  const s = skill.toLowerCase();
  if (s.includes('react')) {
    return [
      {
        question: 'What is the primary benefit of the useMemo hook in React?',
        options: [
          'To memoize expensive calculations between renders',
          'To create side effects on mount',
          'To replace Redux for global state',
          'To fetch data asynchronously',
        ],
        correctAnswer: 'To memoize expensive calculations between renders',
        explanation: 'useMemo caches the result of a calculation between renders until dependencies change.',
        topic: 'Performance Optimization',
      },
      {
        question: 'When does useEffect with an empty dependency array [] run?',
        options: [
          'After the initial render only',
          'On every component re-render',
          'Before the DOM is painted',
          'Only when props change',
        ],
        correctAnswer: 'After the initial render only',
        explanation: 'An empty dependency array tells React that the effect does not depend on any values, running only once on mount.',
        topic: 'Hooks Lifecycle',
      },
      {
        question: 'Why should you avoid using array index as a key in React lists?',
        options: [
          'It can cause component state issues and poor rendering performance when items reorder',
          'React throws a compilation error',
          'Keys must be numbers, not indexes',
          'It disables DOM diffing completely',
        ],
        correctAnswer: 'It can cause component state issues and poor rendering performance when items reorder',
        explanation: 'Index keys break React reconciliation when items are added, removed, or sorted.',
        topic: 'Reconciliation & Keys',
      },
      {
        question: 'What is the purpose of React.memo?',
        options: [
          'A higher order component that skips rendering a component if its props have not changed',
          'A hook for mutating refs',
          'A state manager for React Router',
          'A tool to cache network requests',
        ],
        correctAnswer: 'A higher order component that skips rendering a component if its props have not changed',
        explanation: 'React.memo memoizes the rendered output of the wrapped component preventing unnecessary renders.',
        topic: 'Component Optimization',
      },
      {
        question: 'What does the useCallback hook return?',
        options: [
          'A memoized version of the callback function',
          'The return value of the callback',
          'A Promise that resolves the function',
          'A ref pointing to the callback',
        ],
        correctAnswer: 'A memoized version of the callback function',
        explanation: 'useCallback returns a memoized callback that only changes if one of the dependencies has changed.',
        topic: 'Hooks',
      },
    ];
  }

  if (s.includes('sql')) {
    return [
      {
        question: 'Which SQL clause is used to filter records after aggregation (GROUP BY)?',
        options: ['HAVING', 'WHERE', 'ORDER BY', 'FILTER'],
        correctAnswer: 'HAVING',
        explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.',
        topic: 'Aggregations',
      },
      {
        question: 'What type of JOIN returns all records from both tables whether matched or not?',
        options: ['FULL OUTER JOIN', 'INNER JOIN', 'LEFT JOIN', 'CROSS JOIN'],
        correctAnswer: 'FULL OUTER JOIN',
        explanation: 'FULL OUTER JOIN combines the results of both LEFT and RIGHT outer joins.',
        topic: 'Joins',
      },
      {
        question: 'What does creating an INDEX on a table column primarily improve?',
        options: ['Data retrieval speed (SELECT queries)', 'Data insertion speed', 'Table storage efficiency', 'Transaction isolation'],
        correctAnswer: 'Data retrieval speed (SELECT queries)',
        explanation: 'Indexes create fast lookup paths (like B-trees) speeding up queries at the cost of additional write overhead.',
        topic: 'Indexing & Performance',
      },
      {
        question: 'Which constraint ensures that all values in a column are distinct and not null?',
        options: ['PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY', 'CHECK'],
        correctAnswer: 'PRIMARY KEY',
        explanation: 'PRIMARY KEY uniquely identifies each record and does not allow NULL values.',
        topic: 'Constraints',
      },
      {
        question: 'What is the purpose of the SQL TRANSACTION COMMIT statement?',
        options: [
          'Permanently saves all changes made in the current transaction',
          'Rolls back the current transaction',
          'Creates a savepoint',
          'Closes the database connection',
        ],
        correctAnswer: 'Permanently saves all changes made in the current transaction',
        explanation: 'COMMIT applies all transaction statements permanently to the database.',
        topic: 'ACID & Transactions',
      },
    ];
  }

  // Default: JavaScript / General Fullstack
  return [
    {
      question: 'What is the output of `typeof NaN` in JavaScript?',
      options: ['"number"', '"undefined"', '"object"', '"NaN"'],
      correctAnswer: '"number"',
      explanation: 'In JavaScript specification, NaN (Not a Number) is a numeric data type value.',
      topic: 'Type Coercion',
    },
    {
      question: 'Which mechanism prevents race conditions in Node.js asynchronous event loop?',
      options: [
        'Single-threaded event loop with non-blocking I/O queues',
        'Thread locks and mutexes',
        'Multi-process shared memory',
        'Synchronous blocking operations',
      ],
      correctAnswer: 'Single-threaded event loop with non-blocking I/O queues',
      explanation: 'Node.js runs JavaScript on a single thread event loop handling concurrency through libuv queues.',
      topic: 'Event Loop & Concurrency',
    },
    {
      question: 'What is the main difference between `let` and `var`?',
      options: [
        'let is block-scoped while var is function-scoped',
        'var cannot be reassigned',
        'let is hoisted to the top of the global object',
        'There is no difference in ES6',
      ],
      correctAnswer: 'let is block-scoped while var is function-scoped',
      explanation: 'let variables are bound to their nearest enclosing block { ... } and reside in a temporal dead zone until declared.',
      topic: 'Variable Scoping',
    },
    {
      question: 'What does `Promise.allSettled()` do when one promise rejects?',
      options: [
        'Waits for all promises to settle regardless of rejection and returns an array of status objects',
        'Immediately rejects with that error',
        'Retries the rejected promise 3 times',
        'Throws an unhandled promise rejection error',
      ],
      correctAnswer: 'Waits for all promises to settle regardless of rejection and returns an array of status objects',
      explanation: 'Promise.allSettled never rejects early; it resolves with full inspection of fulfilled and rejected outcomes.',
      topic: 'Async Programming',
    },
    {
      question: 'What is a Closure in JavaScript?',
      options: [
        'A function bundled together with references to its surrounding lexical environment',
        'A method to close browser tabs',
        'A private class destructor',
        'A JSON serialization method',
      ],
      correctAnswer: 'A function bundled together with references to its surrounding lexical environment',
      explanation: 'Closures give an inner function access to an outer function’s scope even after the outer function has returned.',
      topic: 'Closures & Scope',
    },
  ];
}

/**
 * 3. Evaluate Mock Interview Answer & Progress
 */
async function evaluateInterviewAnswer({ role, level, type, question, answer, questionNumber }) {
  const prompt = `
You are a Lead Hiring Manager conducting a ${level} ${role} interview (${type} focus).
The candidate was asked:
"${question}"

The candidate replied:
"${answer}"

Evaluate their response with strict, constructive industry standards.
Return ONLY valid JSON matching this schema:
{
  "score": 78,
  "feedback": "Clear explanation of concepts...",
  "strengths": ["Clear communication", "Mentioned key principles"],
  "improvements": ["Could mention trade-offs", "Add real-world edge case handling"],
  "suggestedAnswer": "A strong answer should highlight...",
  "nextQuestion": "The next interview question to ask the candidate"
}
`;

  if (isAiConfigured && geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.score && parsed.feedback) {
        return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini interview evaluation failed, using expert heuristic:', err.message);
    }
  }

  // Expert fallback evaluation
  const wordCount = (answer || '').trim().split(/\s+/).length;
  let score = 65;
  if (wordCount > 10) score += 10;
  if (wordCount > 30) score += 10;
  if (wordCount > 70) score += 10;
  if (answer.toLowerCase().includes('example') || answer.toLowerCase().includes('project') || answer.toLowerCase().includes('react') || answer.toLowerCase().includes('dom')) score += 5;
  score = Math.min(score, 95);

  const nextQuestions = [
    'How do you handle state synchronization and cache invalidation in distributed applications?',
    'Describe an architectural trade-off you had to navigate in a past project. Why did you choose that path?',
    'How do you approach debugging high-latency API responses in production under heavy load?',
    'What testing strategy do you employ to ensure reliability across frontend and backend boundaries?',
  ];

  return {
    score,
    feedback: `Good structure. You addressed the core question (${wordCount} words provided). To elevate this to a top-tier response, articulate specific trade-offs and production edge cases you encountered.`,
    strengths: ['Addressed the prompt directly', 'Coherent technical vocabulary', 'Practical perspective'],
    improvements: ['Discuss measurable trade-offs', 'Provide a concrete metric or real-world example', 'Highlight edge cases and failure modes'],
    suggestedAnswer: `A comprehensive answer includes: 1) Core definition, 2) Step-by-step mechanism, 3) Real-world example where this saved time or improved performance, 4) Potential bottlenecks and mitigation.`,
    nextQuestion: nextQuestions[questionNumber % nextQuestions.length],
  };
}

/**
 * 4. Generate Personalized Career Roadmap
 */
async function generateCareerRoadmap({ goal = 'Full Stack Developer', currentSkills = [], experienceLevel = 'beginner', memories = [], resumeData = null }) {
  const memoryContext =
    memories.length > 0
      ? `User Memories from Hindsight:\n` + memories.map((m) => `- ${m.text || m}`).join('\n')
      : 'No prior memories stored yet.';

  const prompt = `
Create a personalized 6-phase Career Roadmap for:
Goal: "${goal}"
Experience Level: "${experienceLevel}"
Current Assessed Skills: ${currentSkills.map((s) => `${s.name} (${s.score || 0}%)`).join(', ') || 'None yet'}
${memoryContext}

Return ONLY valid JSON matching this schema:
{
  "goal": "${goal}",
  "estimatedDuration": "6 Months",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Phase Title",
      "duration": "3 Weeks",
      "description": "Clear guidance on what to master in this phase",
      "skills": ["Skill1", "Skill2"],
      "milestones": ["Milestone 1", "Milestone 2"],
      "resources": ["Recommended Resource / Project"]
    }
  ]
}
`;

  if (isAiConfigured && geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.phases && Array.isArray(parsed.phases)) {
        return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini roadmap generation failed, using curated path:', err.message);
    }
  }

  // Curated personalized roadmap based on goal
  return {
    goal,
    estimatedDuration: '6 Months',
    phases: [
      {
        phaseNumber: 1,
        title: 'Core Fundamentals & Modern Web Standards',
        duration: '4 Weeks',
        description: 'Establish rock-solid understanding of modern ES6+, semantic HTML5, CSS layout systems (Flexbox, Grid), and asynchronous JavaScript.',
        skills: ['HTML5/CSS3', 'Modern JavaScript (ES6+)', 'DOM Manipulation', 'Git & GitHub'],
        milestones: ['Build an interactive responsive dashboard', 'Publish 2 clean repositories to GitHub'],
        resources: ['MDN Web Docs', 'JavaScript.info Guide'],
      },
      {
        phaseNumber: 2,
        title: 'Frontend Architecture & React Mastery',
        duration: '5 Weeks',
        description: 'Master component-driven architecture, custom hooks, context API, state management, and optimized render lifecycles.',
        skills: ['React.js', 'Vite & Build Tooling', 'State Management', 'Tailwind CSS'],
        milestones: ['Develop an authenticated single-page application', 'Implement optimistic UI updates and caching'],
        resources: ['React Official Docs', 'Kent C. Dodds Epic React'],
      },
      {
        phaseNumber: 3,
        title: 'Backend Systems & RESTful API Engineering',
        duration: '5 Weeks',
        description: 'Engineer scalable Node.js services with Express.js, implement JWT authentication, secure middleware, and input sanitization.',
        skills: ['Node.js', 'Express.js', 'JWT Auth & Bcrypt', 'REST API Design'],
        milestones: ['Build a secure role-based API with rate limiting and logging', 'Document endpoints with OpenAPI/Swagger'],
        resources: ['Node.js Best Practices Repo', 'Express.js Security Guide'],
      },
      {
        phaseNumber: 4,
        title: 'Database Architecture & Data Modeling',
        duration: '4 Weeks',
        description: 'Deep dive into MongoDB schema design, Mongoose indexing, aggregation pipelines, and relational SQL queries.',
        skills: ['MongoDB & Mongoose', 'PostgreSQL / SQL', 'Query Optimization', 'Database Indexing'],
        milestones: ['Design normalized and document data schemas', 'Benchmark query performance with index analysis'],
        resources: ['MongoDB University', 'Use The Index, Luke (SQL Guide)'],
      },
      {
        phaseNumber: 5,
        title: 'Production Deployment & Cloud DevOps',
        duration: '3 Weeks',
        description: 'Containerize full-stack services with Docker, set up automated CI/CD pipelines, configure CORS, environment secrets, and monitoring.',
        skills: ['Docker & Containers', 'CI/CD Pipelines', 'Cloud Deployment (Vercel/Render)', 'Monitoring & Health Probes'],
        milestones: ['Deploy production full-stack application with automated testing', 'Set up error monitoring and uptime alerts'],
        resources: ['Docker Mastery Guide', 'GitHub Actions Documentation'],
      },
      {
        phaseNumber: 6,
        title: 'System Design & High-Stakes Interview Preparation',
        duration: '3 Weeks',
        description: 'Sharpen algorithm problem-solving (DSA), conduct mock technical interviews, refine resume ATS compatibility, and build portfolio showcase.',
        skills: ['Data Structures & Algorithms', 'System Design Fundamentals', 'Behavioral STAR Method', 'Mock Technical Interviews'],
        milestones: ['Complete 5 AI Mock Technical Interviews', 'Deploy live portfolio project demonstrating full-stack competencies'],
        resources: ['NeetCode Roadmap', 'System Design Primer by Donne Martin'],
      },
    ],
  };
}

/**
 * 5. Evaluate Resume (ATS & Skill Analysis)
 */
async function evaluateResumeText({ resumeText = '', careerGoal = 'Full Stack Developer' }) {
  const prompt = `
Analyze this candidate resume for the target role: "${careerGoal}".
Resume text:
"""
${resumeText.slice(0, 4000)}
"""

Evaluate ATS compatibility, skills found, missing critical skills, and improvements.
Return ONLY valid JSON matching this schema:
{
  "atsScore": 82,
  "detectedRole": "Full Stack Engineer",
  "detectedSkills": ["JavaScript", "React", "Node.js", "Git"],
  "missingSkills": ["Docker", "Redis", "TypeScript", "CI/CD"],
  "experienceSummary": "Candidate shows 1-2 years hands-on experience in web development...",
  "education": ["B.S. in Computer Science or related coursework"],
  "projects": ["E-commerce App", "Task Manager API"],
  "strengths": ["Clear tech stack listed", "Demonstrates full-stack capabilities"],
  "improvements": ["Quantify project impact with metrics", "Add automated testing coverage"],
  "atsFeedback": [
    "Ensure standard headings like 'Skills', 'Experience', 'Education'",
    "Add more action verbs at the start of bullet points"
  ]
}
`;

  if (isAiConfigured && geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.atsScore !== undefined) {
        return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini resume evaluation failed, using rule-based parser:', err.message);
    }
  }

  // Rule-based heuristic extraction
  const lower = resumeText.toLowerCase();
  const knownKeywords = [
    'javascript', 'python', 'java', 'c++', 'react', 'node.js', 'express',
    'mongodb', 'sql', 'postgresql', 'html', 'css', 'typescript', 'docker',
    'aws', 'git', 'rest api', 'graphql', 'redux', 'tailwind', 'linux'
  ];

  const detectedSkills = knownKeywords
    .filter((k) => lower.includes(k))
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1));

  const missingSkills = ['Docker', 'TypeScript', 'Automated Testing (Jest)', 'Redis', 'CI/CD Pipelines']
    .filter((s) => !detectedSkills.some((d) => d.toLowerCase() === s.toLowerCase()));

  let score = 55;
  if (detectedSkills.length > 5) score += 15;
  if (detectedSkills.length > 10) score += 10;
  if (lower.includes('project') || lower.includes('developed')) score += 10;
  if (lower.includes('education') || lower.includes('university') || lower.includes('college')) score += 5;
  score = Math.min(score, 92);

  return {
    atsScore: score,
    detectedRole: careerGoal || 'Software Engineer',
    detectedSkills: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'HTML/CSS', 'Git'],
    missingSkills,
    experienceSummary: `Resume highlights proficiency in ${detectedSkills.slice(0, 4).join(', ') || 'software development'}. Project sections demonstrate hands-on application building.`,
    education: lower.includes('degree') || lower.includes('university') || lower.includes('bachelor')
      ? ['Undergraduate Degree in Engineering/Computer Science or Equivalent']
      : ['Technical coursework and self-directed development track'],
    projects: ['Full-stack web application development', 'RESTful API integration'],
    strengths: [
      'Identified core modern technologies',
      'Logical flow of technical competencies',
      'Hands-on project references present',
    ],
    improvements: [
      'Quantify results (e.g. "reduced load time by 30%", "served 500+ daily active users")',
      'Add industry-standard unit/integration testing tools (Jest, Cypress)',
      'Include links to active GitHub repositories and live deployments',
    ],
    atsFeedback: [
      'Use standard ATS section headings: Summary, Technical Skills, Experience, Projects, Education',
      'Avoid multi-column tables or non-standard fonts that confuse ATS document parsers',
      'Incorporate industry keywords directly matching the job description target',
    ],
  };
}

module.exports = {
  isAiConfigured,
  getAiStatus,
  generateCareerChatResponse,
  generateQuizQuestions,
  evaluateInterviewAnswer,
  generateCareerRoadmap,
  evaluateResumeText,
};
