const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    careerGoal: {
      type: String,
      default: 'Full Stack Developer',
      trim: true,
    },
    targetRole: {
      type: String,
      default: 'Full Stack Developer',
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    currentSkills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
        score: { type: Number, default: 0 },
        lastAssessed: { type: Date, default: Date.now },
      },
    ],
    hindsightBankId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.hindsightBankId) {
      this.hindsightBankId = `career-guidance-${this._id}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
