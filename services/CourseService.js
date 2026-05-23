import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

/**
 * Create a new course
 * @param {Object} courseData - { title, description, mentorId, thumbnail }
 * @returns {Promise<Course>}
 */
export const createCourse = async (courseData) => {
    const { title, description, mentorId, thumbnail } = courseData;

    const course = await Course.create({
        title,
        description: description || '',
        mentor: mentorId,
        thumbnail: thumbnail || '',
        totalLessons: 0,
        totalDuration: 0
    });

    return await course.populate('mentor', 'name email');
};

/**
 * Add lesson to course
 * @param {string} courseId - Course ID
 * @param {Object} lessonData - { title, duration, order }
 * @returns {Promise<Lesson>}
 * @throws {NotFoundError} - Course not found
 */
export const addLesson = async (courseId, lessonData) => {
    const { title, duration, order } = lessonData;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Create lesson
    const lesson = await Lesson.create({
        course: courseId,
        title,
        duration: duration || 0,
        order: order || 1
    });

    // Update course totals
    await updateCourseTotals(courseId);

    return lesson;
};

/**
 * Update course totals (lessons count and duration)
 * @param {string} courseId - Course ID
 * @returns {Promise<Course>}
 * @throws {NotFoundError} - Course not found
 */
export const updateCourseTotals = async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Query all lessons for course
    const lessons = await Lesson.find({ course: courseId });

    // Calculate totals
    const totalLessons = lessons.length;
    const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);

    // Update course
    course.totalLessons = totalLessons;
    course.totalDuration = totalDuration;
    await course.save();

    return course;
};

/**
 * Get course with lessons
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - { course, lessons }
 * @throws {NotFoundError} - Course not found
 */
export const getCourseWithLessons = async (courseId) => {
    const course = await Course.findById(courseId).populate('mentor', 'name email');
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    return {
        course,
        lessons
    };
};

/**
 * Get lessons for enrolled student
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<Array>} - Lessons with completion status
 * @throws {NotFoundError} - Course not found
 * @throws {AuthorizationError} - Student not enrolled
 */
export const getLessonsForStudent = async (courseId, studentId) => {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
    });

    if (!enrollment) {
        throw new AuthorizationError('You are not enrolled in this course');
    }

    // Get lessons
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    // Mark lessons as completed
    const lessonsWithStatus = lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        isCompleted: enrollment.completedLessons.some(
            completedId => completedId.toString() === lesson._id.toString()
        )
    }));

    return lessonsWithStatus;
};

/**
 * Get all courses with optional mentor filter
 * @param {string} mentorId - Optional mentor ID filter
 * @returns {Promise<Course[]>}
 */
export const getAllCourses = async (mentorId = null) => {
    const filter = mentorId ? { mentor: mentorId } : {};
    const courses = await Course.find(filter).populate('mentor', 'name email');
    return courses;
};
