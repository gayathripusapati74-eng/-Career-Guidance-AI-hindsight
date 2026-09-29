const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { users: memoryUsers } = require('../utils/memoryDb');

const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_ai_jwt_super_secret_key_hackathon_2026';

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

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please login again.',
      error: err.message,
    });
  }
}

module.exports = {
  protect,
};
