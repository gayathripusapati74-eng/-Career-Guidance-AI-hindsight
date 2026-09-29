const {
  retainCareerMemory,
  recallCareerMemory,
  reflectCareerGuidance,
  getHindsightStatus,
  getUserBankId,
} = require('../services/hindsight');

/**
 * Direct Retain Memory Endpoint
 * POST /api/memory/retain
 */
async function retain(req, res) {
  try {
    const userId = req.user._id;
    const { content, tags, context } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Memory content string is required',
      });
    }

    const result = await retainCareerMemory(userId, content, { tags, context });

    if (!result.configured) {
      return res.status(503).json({
        success: false,
        configured: false,
        message: result.error,
        bankId: result.bankId,
      });
    }

    return res.json({
      success: result.success,
      configured: true,
      bankId: result.bankId,
      result: result.result,
      content: result.content,
      error: result.error,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retain memory in Hindsight',
      error: err.message,
    });
  }
}

/**
 * Direct Recall Memory Endpoint
 * POST /api/memory/recall
 */
async function recall(req, res) {
  try {
    const userId = req.user._id;
    const { query = 'career goals and skills', maxTokens = 2048, tags } = req.body;

    const result = await recallCareerMemory(userId, query, { maxTokens, tags });

    if (!result.configured) {
      return res.status(503).json({
        success: false,
        configured: false,
        message: result.error,
        bankId: result.bankId,
      });
    }

    return res.json({
      success: result.success,
      configured: true,
      bankId: result.bankId,
      query: result.query,
      count: result.count,
      memories: result.memories,
      error: result.error,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to recall memories from Hindsight',
      error: err.message,
    });
  }
}

/**
 * Direct Reflect Endpoint
 * POST /api/memory/reflect
 */
async function reflect(req, res) {
  try {
    const userId = req.user._id;
    const { query = 'Synthesize my overall career development and milestones', tags, context } = req.body;

    const result = await reflectCareerGuidance(userId, query, { tags, context });

    if (!result.configured) {
      return res.status(503).json({
        success: false,
        configured: false,
        message: result.error,
        bankId: result.bankId,
      });
    }

    return res.json({
      success: result.success,
      configured: true,
      bankId: result.bankId,
      query: result.query,
      reflection: result.reflection,
      basedOn: result.basedOn,
      error: result.error,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to perform Hindsight reflection',
      error: err.message,
    });
  }
}

/**
 * Get Hindsight Health & Status
 * GET /api/memory/status
 */
async function getStatus(req, res) {
  try {
    const userId = req.user ? req.user._id : null;
    const status = await getHindsightStatus(userId);
    return res.json({
      success: true,
      status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check Hindsight status',
      error: err.message,
    });
  }
}

module.exports = {
  retain,
  recall,
  reflect,
  getStatus,
};
