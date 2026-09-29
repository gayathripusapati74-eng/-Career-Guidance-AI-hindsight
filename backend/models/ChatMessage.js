const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    memoriesRecalled: [
      {
        text: String,
        score: Number,
        type: { type: String },
      },
    ],
    retainedMemory: {
      success: Boolean,
      summary: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
