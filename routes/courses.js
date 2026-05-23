import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as CourseController from '../controllers/CourseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize('mentor'),
    [
        body('title').trim().notEmpty().withMessage('Course title is required'),
        body('description').optional().trim(),
        body('thumbnail').optional().trim()
    ],
    validate,
    CourseController.createCourse
);

router.get(
    '/',
    authenticate,
    [query('mentorId').optional().isMongoId().withMessage('mentorId must be a valid ID')],
    validate,
    CourseController.getCourses
);

router.get(
    '/:id',
    authenticate,
    [param('id').isMongoId().withMessage('Course ID must be valid')],
    validate,
    CourseController.getCourse
);

router.post(
    '/:id/lessons',
    authenticate,
    authorize('mentor'),
    [
        param('id').isMongoId().withMessage('Course ID must be valid'),
        body('title').trim().notEmpty().withMessage('Lesson title is required'),
        body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be non-negative'),
        body('order').optional().isInt({ min: 1 }).withMessage('Order must be at least 1')
    ],
    validate,
    CourseController.addLesson
);

export default router;
