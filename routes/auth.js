import { Router } from 'express';
import { body } from 'express-validator';
import * as AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['student', 'mentor']).withMessage('Role must be student or mentor')
    ],
    validate,
    AuthController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    AuthController.login
);

router.post(
    '/verify-email',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
    ],
    validate,
    AuthController.verifyEmail
);

router.post(
    '/resend-verification',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
    ],
    validate,
    AuthController.resendVerification
);

router.get('/me', authenticate, AuthController.me);

export default router;
