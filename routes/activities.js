import { Router } from 'express';
import { query } from 'express-validator';
import * as ActivityController from '../controllers/ActivityController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
    '/',
    authenticate,
    authorize('student'),
    [
        query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
        query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
        query('courseId').optional().isMongoId().withMessage('courseId must be a valid ID'),
        query('activityType')
            .optional()
            .isIn(['lesson_started', 'lesson_completed', 'time_spent', 'course_completed'])
            .withMessage('activityType is invalid')
    ],
    validate,
    ActivityController.getActivities
);

export default router;
