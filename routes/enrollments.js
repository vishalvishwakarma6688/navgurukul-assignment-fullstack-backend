import { Router } from 'express';
import { body, param } from 'express-validator';
import * as EnrollmentController from '../controllers/EnrollmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.post(
    '/',
    [body('courseId').isMongoId().withMessage('Course ID must be valid')],
    validate,
    EnrollmentController.enroll
);

router.get('/', EnrollmentController.getEnrollments);

router.put(
    '/:id/complete-lesson',
    [
        param('id').isMongoId().withMessage('Enrollment ID must be valid'),
        body('lessonId').isMongoId().withMessage('Lesson ID must be valid')
    ],
    validate,
    EnrollmentController.completeLesson
);

router.put(
    '/:id/log-time',
    [
        param('id').isMongoId().withMessage('Enrollment ID must be valid'),
        body('lessonId').isMongoId().withMessage('Lesson ID must be valid'),
        body('minutesSpent').isInt({ min: 1 }).withMessage('Minutes spent must be greater than 0')
    ],
    validate,
    EnrollmentController.logTime
);

router.get(
    '/:id/lessons',
    [param('id').isMongoId().withMessage('Enrollment ID must be valid')],
    validate,
    EnrollmentController.getEnrollmentLessons
);

export default router;
