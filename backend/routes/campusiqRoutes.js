const express = require('express');
const router = express.Router();
const campusiqController = require('../controllers/campusiqController');

// Campus Overview Analytics
router.get('/analytics', campusiqController.getAnalyticsOverview);

// Student Directory & Profile
router.get('/students', campusiqController.getStudents);
router.get('/students/:studentId', campusiqController.getStudentById);

// Early-Warning Radar & Alerts
router.get('/at-risk', campusiqController.getAtRiskStudents);
router.post('/at-risk/review', campusiqController.reviewAtRiskAlert);

// Dynamic 4-Quadrant Student Segmentation
router.get('/segments', campusiqController.getSegmentsOverview);

// What-If Success Simulator
router.post('/simulate', campusiqController.simulateScenario);

// Action Intelligence: Interventions
router.get('/interventions', campusiqController.getInterventions);
router.post('/interventions', campusiqController.createIntervention);
router.patch('/interventions/:id', campusiqController.updateIntervention);

// Data Integration Hub
router.get('/data-hub/history', campusiqController.getDataHubHistory);
router.post('/data-hub/upload', campusiqController.uploadDataset);
router.post('/data-hub/reset-demo', campusiqController.resetDemoData);

// Institutional Config (Weights & Thresholds)
router.get('/config', campusiqController.getConfig);
router.post('/config', campusiqController.updateConfig);

// Reports & Data Export (CSV)
router.get('/reports/export', campusiqController.exportReport);

module.exports = router;
