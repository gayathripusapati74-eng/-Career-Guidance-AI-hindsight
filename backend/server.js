const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Global resilience handlers - prevent server crash on unhandled async errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at]:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err.message || err);
});

const { isConfigured: isHindsightConfigured } = require('./services/hindsight');
const { isAiConfigured } = require('./services/ai');

// Import routes
const authRoutes = require('./routes/authRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const jobsRoutes = require('./routes/jobsRoutes');
const progressRoutes = require('./routes/progressRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const statusRoutes = require('./routes/statusRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// MongoDB Connection
async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-guidance-ai';

  try {
    console.log(`[Database] Connecting to MongoDB at: ${uri}`);
    // Disable buffering when disconnected so operations do not hang
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}`);
    console.log('[Database] System operating with memory fallback repository for seamless demonstration.');
  }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/ai', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/status', statusRoutes);

// Base API probe endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Career Guidance AI API',
    version: '1.0.0',
    description: 'Full-stack AI Career Guidance platform powered by Hindsight Long-term Memory',
    status: 'online',
    hindsightConfigured: isHindsightConfigured,
    aiConfigured: isAiConfigured,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      skills: '/api/skills',
      resume: '/api/resume',
      career: '/api/career',
      chat: '/api/ai/chat',
      quiz: '/api/quiz',
      interview: '/api/interview',
      jobs: '/api/jobs',
      progress: '/api/progress',
      memory: '/api/memory',
      status: '/api/status',
    },
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🚀 CAREER GUIDANCE AI BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`  🔗 Local API: http://localhost:${PORT}`);
    console.log(`  🧠 Hindsight Memory: ${isHindsightConfigured ? '✅ CONFIGURED' : '⚠️ NOT CONFIGURED (Key required in .env)'}`);
    console.log(`  🤖 AI LLM Engine:   ${isAiConfigured ? '✅ ACTIVE' : 'ℹ️ TEMPLATE / EXPERT MODE'}`);
    console.log(`  📦 MongoDB Database: ${mongoose.connection.readyState === 1 ? '✅ CONNECTED' : '⚠️ NOT CONNECTED (Set MONGODB_URI)'}`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
