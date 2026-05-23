import { Router } from 'express';
import { query } from 'express-validator';
import * as DashboardController from '../controllers/DashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/', DashboardController.getDashboard);

router.get(
    '/time-series',
    [
        query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
        query('endDate').optional().isISO8601().withMessage('endDate must be a valid date')
    ],
    validate,
    DashboardController.getTimeSeries
);

router.get('/aggregate', DashboardController.getAggregate);

router.get('/export', DashboardController.exportDashboardCsv);

export default router;
