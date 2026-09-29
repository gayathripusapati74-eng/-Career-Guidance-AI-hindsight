const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const { generateCareerChatResponse } = require('../services/ai');
const { recallCareerMemory, retainCareerMemory } = require('../services/hindsight');
const { messages: memoryMessages } = require('../utils/memoryDb');

/**
 * AI Career Chat with Hindsight Recall & Retain Flow
 * POST /api/ai/chat
 */
async function sendMessage(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    const user = req.user;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const cleanMessage = message.trim();
    const isMongo = mongoose.connection.readyState === 1;

    // 1. RECALL relevant memories from Hindsight
    console.log(`[Chat Flow] 1. Recalling Hindsight memories for user: ${userId}`);
    const recallResult = await recallCareerMemory(userId, cleanMessage, { maxTokens: 2048 });
    const memories = recallResult.success ? recallResult.memories : [];

    // 2. Load recent conversation history
    let recentHistory = [];
    if (isMongo) {
      try {
        recentHistory = await ChatMessage.find({ user: userId }).sort({ createdAt: -1 }).limit(6);
        recentHistory.reverse();
      } catch (e) {
        recentHistory = memoryMessages.filter((m) => m.user === userId).slice(-6);
      }
    } else {
      recentHistory = memoryMessages.filter((m) => m.user === userId).slice(-6);
    }

    // 3. Generate AI Guidance using Recalled Context
    console.log(`[Chat Flow] 2. Generating AI response with ${memories.length} recalled memories`);
    const aiResult = await generateCareerChatResponse({
      message: cleanMessage,
      user,
      memories,
      history: recentHistory,
    });

    // 4. Retain new career facts into Hindsight
    let retainedMemory = null;
    const lowerMsg = cleanMessage.toLowerCase();
    const hasCareerFact =
      lowerMsg.includes('i want to') ||
      lowerMsg.includes('my goal') ||
      lowerMsg.includes('i know') ||
      lowerMsg.includes('i need to improve') ||
      lowerMsg.includes('i prefer') ||
      lowerMsg.includes('i am learning') ||
      lowerMsg.includes('my skill') ||
      lowerMsg.includes('interested in');

    if (hasCareerFact) {
      const factToRetain = `User Stated Career Fact: "${cleanMessage}".`;
      console.log(`[Chat Flow] 3. Retaining new career fact into Hindsight:`, factToRetain);
      const retainResult = await retainCareerMemory(userId, factToRetain, {
        tags: ['user_preference', 'chat_fact', 'career_goal'],
        context: 'Direct User Interaction',
      });
      retainedMemory = {
        success: retainResult.success,
        summary: factToRetain,
      };
    }

    // 5. Store conversation turn
    const userMsgDoc = {
      _id: `msg-${Date.now()}-u`,
      user: userId,
      sender: 'user',
      text: cleanMessage,
      createdAt: new Date(),
    };

    const aiMsgDoc = {
      _id: `msg-${Date.now()}-ai`,
      user: userId,
      sender: 'ai',
      text: aiResult.reply,
      memoriesRecalled: memories.map((m) => ({
        text: m.text,
        score: m.score,
        type: m.type,
      })),
      retainedMemory,
      createdAt: new Date(),
    };

    if (isMongo) {
      try {
        await ChatMessage.create(userMsgDoc);
        await ChatMessage.create(aiMsgDoc);
      } catch (e) {
        memoryMessages.push(userMsgDoc, aiMsgDoc);
      }
    } else {
      memoryMessages.push(userMsgDoc, aiMsgDoc);
    }

    return res.json({
      success: true,
      reply: aiResult.reply,
      memoriesRecalled: memories,
      retainedMemory,
      hindsightConfigured: recallResult.configured,
      liveLlm: aiResult.liveLlm,
      messageId: aiMsgDoc._id,
    });
  } catch (err) {
    console.error('[Chat Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: err.message,
    });
  }
}

/**
 * Get Chat History
 * GET /api/ai/chat/history
 */
async function getChatHistory(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      try {
        messages = await ChatMessage.find({ user: userId }).sort({ createdAt: 1 }).limit(50);
      } catch (e) {
        messages = memoryMessages.filter((m) => m.user === userId);
      }
    } else {
      messages = memoryMessages.filter((m) => m.user === userId);
    }

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load chat history',
      error: err.message,
    });
  }
}

/**
 * Clear Chat History
 * DELETE /api/ai/chat/history
 */
async function clearChatHistory(req, res) {
  try {
    const userId = String(req.user._id || req.user.id);
    if (mongoose.connection.readyState === 1) {
      try {
        await ChatMessage.deleteMany({ user: userId });
      } catch (e) {
        // silent
      }
    }
    const idxs = [];
    memoryMessages.forEach((m, idx) => {
      if (m.user === userId) idxs.push(idx);
    });
    for (let i = idxs.length - 1; i >= 0; i--) {
      memoryMessages.splice(idxs[i], 1);
    }

    return res.json({
      success: true,
      message: 'Chat history cleared. Note: Your long-term memories in Hindsight Cloud remain preserved!',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: err.message,
    });
  }
}

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};
