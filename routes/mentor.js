import { Router } from 'express';
import * as MentorController from '../controllers/MentorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('mentor'));

router.get('/dashboard', MentorController.getDashboard);
router.get('/dashboard/export', MentorController.exportDashboardCsv);

export default router;
