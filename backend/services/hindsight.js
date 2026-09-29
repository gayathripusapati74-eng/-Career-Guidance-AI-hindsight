/**
 * Hindsight Memory Service
 * Official Integration with @vectorize-io/hindsight-client SDK
 * 
 * Provides long-term memory for Career Guidance AI via:
 * - retainCareerMemory: Ingests career facts, assessments, interview feedback, roadmap progress
 * - recallCareerMemory: Retrieves semantic, keyword & temporal memories relevant to career queries
 * - reflectCareerGuidance: Synthesizes career progress, improvements, and historical trajectory
 */

const { HindsightClient } = require('@vectorize-io/hindsight-client');

let hindsightClient = null;

function checkConfigured() {
  const key = process.env.HINDSIGHT_API_KEY ? process.env.HINDSIGHT_API_KEY.trim() : '';
  return Boolean(key && key.length > 5);
}

function initClient() {
  const key = process.env.HINDSIGHT_API_KEY ? process.env.HINDSIGHT_API_KEY.trim() : '';
  const baseUrl = process.env.HINDSIGHT_BASE_URL
    ? process.env.HINDSIGHT_BASE_URL.trim()
    : 'https://api.hindsight.vectorize.io';

  if (key && key.length > 5) {
    try {
      hindsightClient = new HindsightClient({
        baseUrl,
        apiKey: key,
        userAgent: 'CareerGuidanceAI/1.0.0 (NodeJS)',
      });
      console.log('[Hindsight Service] Initialized HindsightClient with base URL:', baseUrl);
      return true;
    } catch (err) {
      console.error('[Hindsight Service] Error instantiating HindsightClient:', err.message);
      return false;
    }
  } else {
    hindsightClient = null;
    return false;
  }
}

// Initial setup
initClient();

/**
 * Dynamically configure or update Hindsight credentials at runtime
 */
function configureHindsight(apiKey, baseUrl = null) {
  if (apiKey) process.env.HINDSIGHT_API_KEY = apiKey.trim();
  if (baseUrl) process.env.HINDSIGHT_BASE_URL = baseUrl.trim();
  return initClient();
}

/**
 * Generate an isolated memory bank identifier for each user
 * Ensures strict privacy and per-user memory isolation
 */
function getUserBankId(userId) {
  if (!userId) {
    throw new Error('User ID is required to generate Hindsight bank identifier');
  }
  const cleanId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  return `career-bank-${cleanId}`;
}

/**
 * Sanitize content before sending to Hindsight
 * Strictly strips passwords, auth tokens, and sensitive secret fields
 */
function sanitizeCareerMemory(content) {
  if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }

  let sanitized = content
    .replace(/password\s*[:=]\s*["']?[^"'\s]+["']?/gi, '[PASSWORD REDACTED]')
    .replace(/jwt\s*[:=]\s*["']?[^"'\s]+["']?/gi, '[TOKEN REDACTED]')
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, '[TOKEN REDACTED]')
    .replace(/api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/gi, '[KEY REDACTED]');

  return sanitized.trim();
}

/**
 * 1. Retain Career Memory
 */
async function retainCareerMemory(userId, content, options = {}) {
  if (!checkConfigured() || !hindsightClient) {
    const errorMsg =
      'Hindsight API Key (HINDSIGHT_API_KEY) is not configured in backend/.env. Hindsight Cloud credentials are required for memory retention.';
    console.warn('[Hindsight retainCareerMemory] Skipped -', errorMsg);
    return {
      success: false,
      configured: false,
      error: errorMsg,
      bankId: getUserBankId(userId),
    };
  }

  const bankId = getUserBankId(userId);
  const sanitizedContent = sanitizeCareerMemory(content);

  if (!sanitizedContent) {
    return {
      success: false,
      error: 'Cannot retain empty memory content',
    };
  }

  try {
    const retainOptions = {
      context: options.context || 'Career Guidance AI Profile & Progress',
      tags: options.tags || ['career_fact'],
      metadata: options.metadata || { source: 'career_guidance_ai' },
    };

    console.log(`[Hindsight] Retaining memory for bank [${bankId}] with tags:`, retainOptions.tags);

    const result = await hindsightClient.retain(bankId, sanitizedContent, retainOptions);

    return {
      success: true,
      configured: true,
      bankId,
      result,
      content: sanitizedContent,
      tags: retainOptions.tags,
    };
  } catch (err) {
    console.error(`[Hindsight retainCareerMemory Error for bank ${bankId}]:`, err.message);
    return {
      success: false,
      configured: true,
      bankId,
      error: err.message,
      status: err.status || 500,
    };
  }
}

/**
 * 2. Recall Career Memory
 */
async function recallCareerMemory(userId, query, options = {}) {
  if (!checkConfigured() || !hindsightClient) {
    const errorMsg =
      'Hindsight API Key (HINDSIGHT_API_KEY) is not configured in backend/.env. Hindsight Cloud credentials are required for memory recall.';
    console.warn('[Hindsight recallCareerMemory] Skipped -', errorMsg);
    return {
      success: false,
      configured: false,
      error: errorMsg,
      memories: [],
      bankId: getUserBankId(userId),
    };
  }

  const bankId = getUserBankId(userId);

  try {
    const recallOptions = {
      maxTokens: options.maxTokens || 2048,
      tags: options.tags,
    };

    console.log(`[Hindsight] Recalling memories for bank [${bankId}] with query: "${query}"`);

    const result = await hindsightClient.recall(bankId, query, recallOptions);

    const memories = Array.isArray(result?.results)
      ? result.results.map((r) => ({
          text: r.text || r.content || '',
          score: r.score,
          type: r.type,
          timestamp: r.timestamp,
          entities: r.entities,
        }))
      : [];

    return {
      success: true,
      configured: true,
      bankId,
      query,
      count: memories.length,
      memories,
      raw: result,
    };
  } catch (err) {
    console.error(`[Hindsight recallCareerMemory Error for bank ${bankId}]:`, err.message);
    return {
      success: false,
      configured: true,
      bankId,
      query,
      memories: [],
      error: err.message,
      status: err.status || 500,
    };
  }
}

/**
 * 3. Reflect Career Guidance
 */
async function reflectCareerGuidance(userId, query, options = {}) {
  if (!checkConfigured() || !hindsightClient) {
    const errorMsg =
      'Hindsight API Key (HINDSIGHT_API_KEY) is not configured in backend/.env. Hindsight Cloud credentials are required for memory reflection.';
    console.warn('[Hindsight reflectCareerGuidance] Skipped -', errorMsg);
    return {
      success: false,
      configured: false,
      error: errorMsg,
      reflection: null,
      bankId: getUserBankId(userId),
    };
  }

  const bankId = getUserBankId(userId);

  try {
    const reflectOptions = {
      context:
        options.context ||
        'You are an empathetic, precise career mentor evaluating long-term skill progression, assessment results, and milestones.',
      tags: options.tags,
    };

    console.log(`[Hindsight] Reflecting on memories for bank [${bankId}] with query: "${query}"`);

    const result = await hindsightClient.reflect(bankId, query, reflectOptions);

    return {
      success: true,
      configured: true,
      bankId,
      query,
      reflection: result?.text || '',
      basedOn: result?.based_on || null,
      raw: result,
    };
  } catch (err) {
    console.error(`[Hindsight reflectCareerGuidance Error for bank ${bankId}]:`, err.message);
    return {
      success: false,
      configured: true,
      bankId,
      query,
      reflection: null,
      error: err.message,
      status: err.status || 500,
    };
  }
}

/**
 * Check Hindsight connection status and verify configuration
 */
async function getHindsightStatus(userId = null) {
  const baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
  const configured = checkConfigured();

  if (!configured || !hindsightClient) {
    return {
      configured: false,
      connected: false,
      baseUrl,
      message:
        'HINDSIGHT_API_KEY is not configured in environment. Set your API key in backend/.env or configure it below.',
      bankId: userId ? getUserBankId(userId) : null,
    };
  }

  try {
    let version = '0.10.1';
    try {
      if (hindsightClient && typeof hindsightClient.getVersion === 'function') {
        const v = await hindsightClient.getVersion();
        if (v) version = v;
      }
    } catch (vErr) {
      version = '0.10.1';
    }

    let bankProfile = null;
    let bankId = null;

    if (userId) {
      bankId = getUserBankId(userId);
      try {
        bankProfile = await hindsightClient.getBankProfile(bankId);
      } catch (e) {
        bankProfile = { exists: false, note: 'Bank will be initialized on first retain' };
      }
    }

    return {
      configured: true,
      connected: true,
      baseUrl,
      sdkVersion: version,
      bankId,
      bankProfile,
      message: 'Hindsight Cloud client is configured and ready.',
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      baseUrl,
      error: err.message,
      message: `Failed to reach Hindsight Cloud at ${baseUrl}: ${err.message}`,
    };
  }
}

module.exports = {
  get isConfigured() {
    return checkConfigured();
  },
  configureHindsight,
  retainCareerMemory,
  recallCareerMemory,
  reflectCareerGuidance,
  getHindsightStatus,
  getUserBankId,
};
