import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import ActivityLog from '../models/ActivityLog.js';
import {
    ValidationError,
    AuthorizationError,
    ConflictError,
    NotFoundError
} from '../utils/errors.js';

/**
 * Calculate progress percentage
 * @param {number} completedCount - Number of completed lessons
 * @param {number} totalLessons - Total number of lessons in course
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (completedCount, totalLessons) => {
    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100 * 100) / 100;
};

/**
 * Determine enrollment status based on progress
 * @param {Enrollment} enrollment - Enrollment document
 * @param {Course} course - Course document
 * @returns {string} - Status (not_started, in_progress, completed)
 */
export const determineStatus = (enrollment, course) => {
    const completedCount = enrollment.completedLessons.length;
    const totalLessons = course.totalLessons;

    if (completedCount === 0) {
        return 'not_started';
    } else if (completedCount < totalLessons) {
        return 'in_progress';
    } else {
        return 'completed';
    }
};

/**
 * Enroll student in a course
 * @param {string} studentId - Student user ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Enrollment>}
 * @throws {NotFoundError} - Course not found
 * @throws {ConflictError} - Duplicate enrollment
 */
export const enrollStudent = async (studentId, courseId) => {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Check for duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
    });

    if (existingEnrollment) {
        throw new ConflictError('You are already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        status: 'not_started',
        progressPercentage: 0,
        totalTimeSpent: 0,
        lastAccessedAt: new Date()
    });

    return await enrollment.populate('course');
};

/**
 * Mark lesson as completed
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Enrollment>}
 * @throws {NotFoundError} - Enrollment or lesson not found
 * @throws {ConflictError} - Lesson already completed
 */
export const completeLesson = async (enrollmentId, lessonId) => {
    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId).populate('course');
    if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Lesson not found');
    }
    if (lesson.course.toString() !== enrollment.course._id.toString()) {
        throw new AuthorizationError('Lesson does not belong to this enrollment course');
    }

    // Check if lesson already completed
    if (enrollment.completedLessons.some(completedId => completedId.toString() === lessonId)) {
        throw new ConflictError('Lesson already completed');
    }

    // Add lesson to completedLessons
    enrollment.completedLessons.push(lessonId);

    // Recalculate progress
    const course = enrollment.course;
    enrollment.progressPercentage = calculateProgress(
        enrollment.completedLessons.length,
        course.totalLessons
    );

    // Update status
    enrollment.status = determineStatus(enrollment, course);

    // Update lastAccessedAt
    enrollment.lastAccessedAt = new Date();

    // Save enrollment
    await enrollment.save();

    // Create activity log
    await ActivityLog.create({
        student: enrollment.student,
        course: enrollment.course._id,
        lesson: lessonId,
        activityType: 'lesson_completed',
        minutesSpent: 0,
        activityDate: new Date()
    });

    // Check if course is completed
    if (enrollment.status === 'completed') {
        await ActivityLog.create({
            student: enrollment.student,
            course: enrollment.course._id,
            activityType: 'course_completed',
            minutesSpent: 0,
            activityDate: new Date()
        });
    }

    return enrollment;
};

/**
 * Log time spent on a lesson
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} lessonId - Lesson ID
 * @param {number} minutesSpent - Minutes spent on lesson
 * @returns {Promise<Enrollment>}
 * @throws {ValidationError} - Invalid minutesSpent
 * @throws {NotFoundError} - Enrollment or lesson not found
 */
export const logTimeSpent = async (enrollmentId, lessonId, minutesSpent) => {
    // Validate minutesSpent
    if (minutesSpent <= 0) {
        throw new ValidationError('Minutes spent must be greater than 0');
    }

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Lesson not found');
    }
    if (lesson.course.toString() !== enrollment.course.toString()) {
        throw new AuthorizationError('Lesson does not belong to this enrollment course');
    }

    // Add minutesSpent to totalTimeSpent
    enrollment.totalTimeSpent += minutesSpent;

    // Update lastAccessedAt
    enrollment.lastAccessedAt = new Date();

    // Update status to in_progress if not_started
    if (enrollment.status === 'not_started') {
        enrollment.status = 'in_progress';
    }

    // Save enrollment
    await enrollment.save();

    // Create activity log
    await ActivityLog.create({
        student: enrollment.student,
        course: enrollment.course,
        lesson: lessonId,
        activityType: 'time_spent',
        minutesSpent: minutesSpent,
        activityDate: new Date()
    });

    return enrollment;
};

/**
 * Get student enrollments with populated data
 * @param {string} studentId - Student user ID
 * @returns {Promise<Enrollment[]>}
 */
export const getStudentEnrollments = async (studentId) => {
    const enrollments = await Enrollment.find({ student: studentId })
        .populate('course', 'title description thumbnail totalLessons totalDuration')
        .sort({ lastAccessedAt: -1 });

    return enrollments;
};
