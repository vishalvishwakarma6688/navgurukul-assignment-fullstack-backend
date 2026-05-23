import Course from '../models/Course.js';
import * as CourseService from '../services/CourseService.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';

export const createCourse = async (req, res, next) => {
    try {
        const course = await CourseService.createCourse({
            ...req.body,
            mentorId: req.user.id
        });

        return res.status(201).json({ course });
    } catch (error) {
        return next(error);
    }
};

export const getCourses = async (req, res, next) => {
    try {
        const courses = await CourseService.getAllCourses(req.query.mentorId || null);
        return res.status(200).json(courses);
    } catch (error) {
        return next(error);
    }
};

export const getCourse = async (req, res, next) => {
    try {
        const result = await CourseService.getCourseWithLessons(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const addLesson = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            throw new NotFoundError('Course not found');
        }

        if (course.mentor.toString() !== req.user.id) {
            throw new AuthorizationError('Only the course mentor can add lessons');
        }

        const lesson = await CourseService.addLesson(req.params.id, req.body);
        return res.status(201).json({ lesson });
    } catch (error) {
        return next(error);
    }
};
