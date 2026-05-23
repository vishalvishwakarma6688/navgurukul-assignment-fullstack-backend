import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

/**
 * Log an activity event
 * @param {Object} activityData - { studentId, courseId, lessonId, activityType, minutesSpent }
 * @returns {Promise<ActivityLog>}
 */
export const logActivity = async (activityData) => {
    const { studentId, courseId, lessonId, activityType, minutesSpent } = activityData;

    const activity = await ActivityLog.create({
        student: studentId,
        course: courseId,
        lesson: lessonId,
        activityType,
        minutesSpent: minutesSpent || 0,
        activityDate: new Date()
    });

    return activity;
};

/**
 * Get activities for a student with filters
 * @param {string} studentId - Student user ID
 * @param {Object} filters - { startDate, endDate, courseId, activityType }
 * @returns {Promise<ActivityLog[]>}
 */
export const getActivities = async (studentId, filters = {}) => {
    const { startDate, endDate, courseId, activityType } = filters;

    // Build query
    const query = { student: studentId };

    if (startDate || endDate) {
        query.activityDate = {};
        if (startDate) {
            query.activityDate.$gte = new Date(startDate);
        }
        if (endDate) {
            query.activityDate.$lte = new Date(endDate);
        }
    }

    if (courseId) {
        query.course = courseId;
    }

    if (activityType) {
        query.activityType = activityType;
    }

    // Execute query
    const activities = await ActivityLog.find(query)
        .populate('course', 'title')
        .populate('lesson', 'title')
        .sort({ activityDate: -1 });

    return activities;
};

/**
 * Aggregate activities by date
 * @param {string} studentId - Student user ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - [{ _id: date, totalMinutes }]
 */
export const aggregateByDate = async (studentId, startDate, endDate) => {
    const result = await ActivityLog.aggregate([
        {
            $match: {
                student: new mongoose.Types.ObjectId(studentId),
                activityDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$activityDate' }
                },
                totalMinutes: { $sum: '$minutesSpent' }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    return result;
};
