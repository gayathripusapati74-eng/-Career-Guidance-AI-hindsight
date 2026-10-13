const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { users: memoryUsers } = require('../utils/memoryDb');

const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_ai_jwt_super_secret_key_hackathon_2026';

// In-memory blacklist for revoked JWT session tokens upon logout
const revokedTokens = new Set();

function revokeToken(token) {
  if (token) revokedTokens.add(token);
}

async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.',
    });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Session has been invalidated. Please login again.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        user = null;
      }
    }

    if (!user) {
      user = memoryUsers.get(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach verified user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please login again.',
      error: err.message,
    });
  }
}

/**
 * Role-based authorization middleware
 * Usage: authorize('admin'), authorize('admin', 'faculty'), etc.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    const userRole = req.user.role || 'student';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${userRole}' is not authorized to access this resource. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
}

module.exports = {
  protect,
  authorize,
  revokeToken,
};
