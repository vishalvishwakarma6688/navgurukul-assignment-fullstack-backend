import Enrollment from '../models/Enrollment.js';
import * as CourseService from '../services/CourseService.js';
import * as EnrollmentService from '../services/EnrollmentService.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';

const getOwnedEnrollment = async (enrollmentId, studentId) => {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
    }

    if (enrollment.student.toString() !== studentId) {
        throw new AuthorizationError('You can only access your own enrollment');
    }

    return enrollment;
};

export const enroll = async (req, res, next) => {
    try {
        const enrollment = await EnrollmentService.enrollStudent(req.user.id, req.body.courseId);
        return res.status(201).json({ enrollment });
    } catch (error) {
        return next(error);
    }
};

export const getEnrollments = async (req, res, next) => {
    try {
        const enrollments = await EnrollmentService.getStudentEnrollments(req.user.id);
        return res.status(200).json({ enrollments });
    } catch (error) {
        return next(error);
    }
};

export const completeLesson = async (req, res, next) => {
    try {
        await getOwnedEnrollment(req.params.id, req.user.id);
        const enrollment = await EnrollmentService.completeLesson(req.params.id, req.body.lessonId);
        return res.status(200).json({ enrollment });
    } catch (error) {
        return next(error);
    }
};

export const logTime = async (req, res, next) => {
    try {
        await getOwnedEnrollment(req.params.id, req.user.id);
        const enrollment = await EnrollmentService.logTimeSpent(
            req.params.id,
            req.body.lessonId,
            req.body.minutesSpent
        );
        return res.status(200).json({ enrollment });
    } catch (error) {
        return next(error);
    }
};

export const getEnrollmentLessons = async (req, res, next) => {
    try {
        const enrollment = await getOwnedEnrollment(req.params.id, req.user.id);
        const lessons = await CourseService.getLessonsForStudent(
            enrollment.course.toString(),
            req.user.id
        );

        return res.status(200).json({ lessons });
    } catch (error) {
        return next(error);
    }
};
