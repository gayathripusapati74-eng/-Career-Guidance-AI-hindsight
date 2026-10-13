const express = require('express');
const router = express.Router();
const campusiqController = require('../controllers/campusiqController');
const { protect, authorize } = require('../middleware/auth');

// 1. Role-Specific Scoped Dashboards
router.get('/student/me', protect, campusiqController.getStudentSelfProfile);
router.get('/student/dashboard', protect, campusiqController.getStudentDashboardData);
router.get('/faculty/dashboard', protect, authorize('faculty', 'admin'), campusiqController.getFacultyDashboardData);

// 2. Campus Overview Analytics (Admin & Faculty)
router.get('/analytics', protect, authorize('admin', 'faculty'), campusiqController.getAnalyticsOverview);

// 3. Student Directory & Profile Drilldown
router.get('/students', protect, authorize('admin', 'faculty'), campusiqController.getStudents);
router.get('/students/:studentId', protect, campusiqController.getStudentById);

// 4. Early-Warning Radar & Alerts (Admin & Faculty)
router.get('/at-risk', protect, authorize('admin', 'faculty'), campusiqController.getAtRiskStudents);
router.post('/at-risk/review', protect, authorize('admin', 'faculty'), campusiqController.reviewAtRiskAlert);

// 5. Dynamic 4-Quadrant Student Segmentation (Admin & Faculty)
router.get('/segments', protect, authorize('admin', 'faculty'), campusiqController.getSegmentsOverview);

// 6. What-If Success Simulator (Admin & Faculty)
router.post('/simulate', protect, authorize('admin', 'faculty'), campusiqController.simulateScenario);

// 7. Action Intelligence: Interventions (Scoped for Students, Created by Faculty/Admin)
router.get('/interventions', protect, campusiqController.getInterventions);
router.post('/interventions', protect, authorize('admin', 'faculty'), campusiqController.createIntervention);
router.patch('/interventions/:id', protect, authorize('admin', 'faculty'), campusiqController.updateIntervention);

// 8. Data Integration Hub (Admin Only)
router.get('/data-hub/history', protect, authorize('admin'), campusiqController.getDataHubHistory);
router.post('/data-hub/upload', protect, authorize('admin'), campusiqController.uploadDataset);
router.post('/data-hub/reset-demo', protect, authorize('admin'), campusiqController.resetDemoData);

// 9. Institutional Config (Weights & Thresholds) (Admin Only)
router.get('/config', protect, authorize('admin'), campusiqController.getConfig);
router.post('/config', protect, authorize('admin'), campusiqController.updateConfig);

// 10. Reports & Data Export (CSV) (Admin Only)
router.get('/reports/export', protect, authorize('admin'), campusiqController.exportReport);

module.exports = router;
