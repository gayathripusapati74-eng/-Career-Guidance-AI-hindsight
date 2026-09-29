const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { retainCareerMemory, getUserBankId } = require('../services/hindsight');
const { users: memoryUsers, progressMap } = require('../utils/memoryDb');

const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_ai_jwt_super_secret_key_hackathon_2026';

function generateToken(id) {
  return jwt.sign({ id: String(id) }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, confirmPassword, careerGoal, targetRole, experienceLevel } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: First Name, Last Name, Email, Password',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const defaultGoal = (careerGoal || 'Full Stack Developer').trim();
    const defaultRole = (targetRole || 'Full Stack Developer').trim();
    const isMongo = mongoose.connection.readyState === 1;

    let existingUser = null;
    if (isMongo) {
      try {
        existingUser = await User.findOne({ email: cleanEmail });
      } catch (e) {
        existingUser = null;
      }
    } else {
      for (const u of memoryUsers.values()) {
        if (u.email === cleanEmail) {
          existingUser = u;
          break;
        }
      }
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    let user = null;
    let userId = null;

    if (isMongo) {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password,
        careerGoal: defaultGoal,
        targetRole: defaultRole,
        experienceLevel: experienceLevel || 'beginner',
      });
      userId = user._id;

      await Progress.create({
        user: userId,
        milestones: [
          { title: 'Created Career Guidance AI Profile', category: 'Account', date: new Date() },
        ],
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      userId = `user-${Date.now()}`;

      user = {
        _id: userId,
        id: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        careerGoal: defaultGoal,
        targetRole: defaultRole,
        experienceLevel: experienceLevel || 'beginner',
        currentSkills: [],
        hindsightBankId: getUserBankId(userId),
        comparePassword: async function (pass) {
          return bcrypt.compare(pass, this.password);
        },
      };
      memoryUsers.set(userId, user);

      progressMap.set(userId, {
        user: userId,
        skillAssessmentsCount: 0,
        quizzesTaken: 0,
        interviewsCompleted: 0,
        averageSkillScore: 0,
        averageQuizScore: 0,
        averageInterviewScore: 0,
        resumeScore: 0,
        completedRoadmapPhases: 0,
        totalRoadmapPhases: 6,
        milestones: [
          { title: 'Created Career Guidance AI Profile', category: 'Account', date: new Date() },
        ],
        hindsightReflections: [],
      });
    }

    // Retain initial profile into Hindsight
    const memoryContent = `Candidate Profile Initialized: Name is ${user.firstName} ${user.lastName}. Stated career goal: "${defaultGoal}". Target role: "${defaultRole}". Initial experience level: ${user.experienceLevel}.`;
    retainCareerMemory(userId, memoryContent, {
      tags: ['profile', 'career_goal', 'registration'],
      context: 'Initial User Onboarding',
    }).catch((err) => {
      console.warn('[Register] Background Hindsight retention notice:', err.message);
    });

    const token = generateToken(userId);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        currentSkills: user.currentSkills || [],
        hindsightBankId: user.hindsightBankId || getUserBankId(userId),
      },
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: err.message,
    });
  }
}

/**
 * Login existing user
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isMongo = mongoose.connection.readyState === 1;
    let user = null;

    if (isMongo) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      for (const u of memoryUsers.values()) {
        if (u.email === cleanEmail) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        currentSkills: user.currentSkills || [],
        hindsightBankId: user.hindsightBankId || getUserBankId(userId),
      },
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message,
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const user = req.user;
    const userId = user._id || user.id;
    return res.json({
      success: true,
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        currentSkills: user.currentSkills || [],
        hindsightBankId: user.hindsightBankId || getUserBankId(userId),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: err.message,
    });
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    const { careerGoal, targetRole, experienceLevel, currentSkills } = req.body;
    const user = req.user;
    const userId = user._id || user.id;

    if (careerGoal) user.careerGoal = careerGoal.trim();
    if (targetRole) user.targetRole = targetRole.trim();
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (Array.isArray(currentSkills)) user.currentSkills = currentSkills;

    if (mongoose.connection.readyState === 1 && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(userId, user);
    }

    // Retain profile changes in Hindsight
    const updateSummary = `Updated career trajectory: Goal set to "${user.careerGoal}", Target Role is "${user.targetRole}", Level: "${user.experienceLevel}".`;
    retainCareerMemory(userId, updateSummary, {
      tags: ['profile_update', 'career_goal'],
      context: 'User Profile Modification',
    }).catch((err) => console.warn('[Profile Update] Hindsight retain error:', err.message));

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        currentSkills: user.currentSkills || [],
        hindsightBankId: user.hindsightBankId || getUserBankId(userId),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message,
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
