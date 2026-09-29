/**
 * Job Recommendations Controller
 * High-quality curated job listings clearly marked as DEMO data as per hackathon requirements
 */

const DEMO_JOBS = [
  {
    id: 'job-1',
    title: 'Full Stack Engineer',
    company: 'Nexus Cloud Systems',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    experienceLevel: 'Junior / Mid-Level',
    salary: '$85,000 - $115,000',
    postedDate: '2 days ago',
    requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'REST APIs'],
    description:
      'Join our core product team building high-performance customer dashboards. You will work across the React frontend and Node.js backend microservices.',
    applyUrl: 'https://example.com/apply/nexus-fullstack',
    isDemo: true,
  },
  {
    id: 'job-2',
    title: 'Frontend React Developer',
    company: 'Veloce Interactive',
    location: 'Hybrid (San Francisco, CA)',
    type: 'Full-time',
    experienceLevel: 'Junior',
    salary: '$75,000 - $95,000',
    postedDate: '3 days ago',
    requiredSkills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Git'],
    description:
      'We are seeking a detail-oriented Frontend Developer to craft sleek web user interfaces, responsive layouts, and interactive component libraries.',
    applyUrl: 'https://example.com/apply/veloce-frontend',
    isDemo: true,
  },
  {
    id: 'job-3',
    title: 'Backend Node.js & API Engineer',
    company: 'StreamLine Data',
    location: 'Remote (US/Canada)',
    type: 'Full-time',
    experienceLevel: 'Mid-Level',
    salary: '$100,000 - $130,000',
    postedDate: 'Just now',
    requiredSkills: ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'Docker'],
    description:
      'Scale our distributed REST APIs, implement secure token-based authentication, and optimize database indexing and query latency.',
    applyUrl: 'https://example.com/apply/streamline-backend',
    isDemo: true,
  },
  {
    id: 'job-4',
    title: 'Junior Software Engineer',
    company: 'Innovate Labs',
    location: 'Remote (Global)',
    type: 'Full-time',
    experienceLevel: 'Junior',
    salary: '$65,000 - $85,000',
    postedDate: '1 week ago',
    requiredSkills: ['JavaScript', 'Python', 'HTML/CSS', 'Git', 'Data Structures'],
    description:
      'Great entry-level opportunity for aspiring engineers. Mentorship provided by senior architects with hands-on full-stack assignments.',
    applyUrl: 'https://example.com/apply/innovate-junior',
    isDemo: true,
  },
  {
    id: 'job-5',
    title: 'Full Stack MERN Developer',
    company: 'Pulse Health Technologies',
    location: 'Remote (US)',
    type: 'Full-time',
    experienceLevel: 'Mid-Level',
    salary: '$95,000 - $125,000',
    postedDate: '4 days ago',
    requiredSkills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TypeScript'],
    description:
      'Develop HIPAA-compliant patient communication web portals with React, Node.js, and MongoDB document databases.',
    applyUrl: 'https://example.com/apply/pulse-mern',
    isDemo: true,
  },
  {
    id: 'job-6',
    title: 'Database & Systems Specialist',
    company: 'Apex Data Services',
    location: 'On-site (Austin, TX)',
    type: 'Full-time',
    experienceLevel: 'Mid-Level',
    salary: '$90,000 - $120,000',
    postedDate: '5 days ago',
    requiredSkills: ['SQL', 'MongoDB', 'Node.js', 'Data Structures'],
    description:
      'Focus on database schema architecture, aggregation pipelines, performance tuning, and data migration pipelines.',
    applyUrl: 'https://example.com/apply/apex-database',
    isDemo: true,
  },
];

/**
 * Get Job Recommendations with Skill Matching
 * GET /api/jobs
 */
async function getJobs(req, res) {
  try {
    const { role, skill, location, experienceLevel } = req.query;
    const user = req.user;

    const userSkills = (user?.currentSkills || []).map((s) => s.name.toLowerCase());
    const userGoal = (user?.careerGoal || '').toLowerCase();

    // Filter jobs
    let filtered = DEMO_JOBS.filter((job) => {
      if (role && !job.title.toLowerCase().includes(role.toLowerCase())) return false;
      if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (
        experienceLevel &&
        !job.experienceLevel.toLowerCase().includes(experienceLevel.toLowerCase())
      ) {
        return false;
      }
      if (skill) {
        const hasSkill = job.requiredSkills.some((s) =>
          s.toLowerCase().includes(skill.toLowerCase())
        );
        if (!hasSkill) return false;
      }
      return true;
    });

    // Calculate match score based on candidate's skills
    const enriched = filtered.map((job) => {
      let matchedCount = 0;
      const matchedSkills = [];
      const missingSkills = [];

      job.requiredSkills.forEach((reqSkill) => {
        const found = userSkills.some((us) => us.includes(reqSkill.toLowerCase()));
        if (found) {
          matchedCount += 1;
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      });

      let matchPercentage = Math.round((matchedCount / job.requiredSkills.length) * 100);
      if (userGoal && job.title.toLowerCase().includes(userGoal)) {
        matchPercentage = Math.min(100, matchPercentage + 15);
      }

      return {
        ...job,
        matchPercentage: Math.max(matchPercentage, 35),
        matchedSkills,
        missingSkills,
      };
    });

    // Sort by highest match score
    enriched.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({
      success: true,
      count: enriched.length,
      isDemoData: true,
      demoNotice:
        'All job postings are high-quality DEMO records designed for hackathon evaluation and skill gap simulation.',
      jobs: enriched,
    });
  } catch (err) {
    console.error('[Jobs Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job recommendations',
      error: err.message,
    });
  }
}

module.exports = {
  getJobs,
};
