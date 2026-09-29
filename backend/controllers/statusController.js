const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { getAiStatus } = require('../services/ai');
const { getHindsightStatus, configureHindsight } = require('../services/hindsight');

/**
 * System Health & Integration Status Prober
 * GET /api/status
 */
async function getSystemStatus(req, res) {
  try {
    const userId = req.user ? req.user._id || req.user.id : null;

    // 1. MongoDB Status
    const mongoState = mongoose.connection.readyState;
    const isMongoConnected = mongoState === 1;
    const mongoStatus = {
      connected: isMongoConnected,
      status: isMongoConnected ? 'Connected' : 'Not connected',
      host: mongoose.connection.host || '127.0.0.1',
      dbName: mongoose.connection.name || 'career-guidance-ai',
      readyState: mongoState,
    };

    // 2. AI API Status
    const aiStatus = getAiStatus();

    // 3. Hindsight Status
    const hindsightStatus = await getHindsightStatus(userId);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          name: 'MongoDB Database',
          connected: mongoStatus.connected,
          statusText: mongoStatus.status,
          details: mongoStatus,
        },
        ai: {
          name: 'AI LLM API',
          configured: aiStatus.configured,
          statusText: aiStatus.configured ? 'Configured' : 'Not configured (Mock / Template Engine Active)',
          details: aiStatus,
        },
        hindsight: {
          name: 'Hindsight Cloud Memory Layer',
          configured: hindsightStatus.configured,
          connected: hindsightStatus.connected,
          statusText: !hindsightStatus.configured
            ? 'Not configured'
            : hindsightStatus.connected
            ? 'Connected'
            : 'Configured / Connection Pending',
          details: hindsightStatus,
        },
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    console.error('[Status Probe Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to probe system status',
      error: err.message,
    });
  }
}

/**
 * Update Runtime & Persistent Configuration for Hindsight or AI
 * POST /api/status/config
 */
async function updateConfig(req, res) {
  try {
    const { hindsightApiKey, hindsightBaseUrl } = req.body;

    if (!hindsightApiKey || hindsightApiKey.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hindsight API Key is required',
      });
    }

    const cleanKey = hindsightApiKey.trim();
    const cleanUrl = hindsightBaseUrl ? hindsightBaseUrl.trim() : 'https://api.hindsight.vectorize.io';

    // 1. Configure in-memory runtime
    configureHindsight(cleanKey, cleanUrl);

    // 2. Persist to backend/.env
    try {
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      if (envContent.includes('HINDSIGHT_API_KEY=')) {
        envContent = envContent.replace(/HINDSIGHT_API_KEY=.*/g, `HINDSIGHT_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nHINDSIGHT_API_KEY=${cleanKey}`;
      }

      if (cleanUrl) {
        if (envContent.includes('HINDSIGHT_BASE_URL=')) {
          envContent = envContent.replace(/HINDSIGHT_BASE_URL=.*/g, `HINDSIGHT_BASE_URL=${cleanUrl}`);
        } else {
          envContent += `\nHINDSIGHT_BASE_URL=${cleanUrl}`;
        }
      }

      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('[Config Update] Updated HINDSIGHT_API_KEY in backend/.env');
    } catch (fsErr) {
      console.warn('[Config Update] Could not write to .env file, configured in memory only:', fsErr.message);
    }

    // 3. Test the connection
    const userId = req.user ? req.user._id || req.user.id : null;
    const testStatus = await getHindsightStatus(userId);

    return res.json({
      success: true,
      message: 'Hindsight Cloud API Key saved and initialized!',
      status: testStatus,
    });
  } catch (err) {
    console.error('[Config Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: err.message,
    });
  }
}

module.exports = {
  getSystemStatus,
  updateConfig,
};
