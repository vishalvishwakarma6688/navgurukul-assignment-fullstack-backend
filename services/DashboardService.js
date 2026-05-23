import Enrollment from '../models/Enrollment.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';
import { toCsv } from '../utils/csv.js';

/**
 * Get comprehensive dashboard data for a student
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object>} - { enrollments, summary }
 */
export const getDashboardData = async (studentId) => {
    // Get all enrollments
    const enrollments = await Enrollment.find({ student: studentId })
        .populate('course', 'title description thumbnail totalLessons')
        .sort({ lastAccessedAt: -1 });

    // Calculate summary statistics
    const totalCourses = enrollments.length;
    const totalTimeSpent = enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0);
    const totalLessonsCompleted = enrollments.reduce(
        (sum, e) => sum + e.completedLessons.length,
        0
    );
    const averageProgress = totalCourses > 0
        ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / totalCourses
        : 0;

    // Format enrollments
    const formattedEnrollments = enrollments.map(enrollment => ({
        id: enrollment._id,
        course: {
            id: enrollment.course._id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnail: enrollment.course.thumbnail,
            totalLessons: enrollment.course.totalLessons
        },
        status: enrollment.status,
        progressPercentage: enrollment.progressPercentage,
        totalTimeSpent: enrollment.totalTimeSpent,
        completedLessonsCount: enrollment.completedLessons.length,
        lastAccessedAt: enrollment.lastAccessedAt
    }));

    return {
        enrollments: formattedEnrollments,
        summary: {
            totalCourses,
            totalTimeSpent,
            totalLessonsCompleted,
            averageProgress: Math.round(averageProgress * 100) / 100
        }
    };
};

/**
 * Get time series data for trend visualization
 * @param {string} studentId - Student user ID
 * @param {Date} startDate - Start date (default: 30 days ago)
 * @param {Date} endDate - End date (default: today)
 * @returns {Promise<Array>} - [{ date, minutesSpent }]
 */
export const getTimeSeriesData = async (studentId, startDate = null, endDate = null) => {
    // Default to last 30 days
    if (!endDate) {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }
    if (!startDate) {
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
    }

    // Aggregate activities by date
    const aggregatedData = await ActivityLog.aggregate([
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

    // Convert to map for easy lookup
    const dataMap = {};
    aggregatedData.forEach(item => {
        dataMap[item._id] = item.totalMinutes;
    });

    // Fill gaps with zero values
    const timeSeriesData = fillTimeSeriesGaps(dataMap, startDate, endDate);

    return timeSeriesData;
};

/**
 * Fill missing dates in time series with zero values
 * @param {Object} dataMap - Map of date strings to minutes
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Complete time series
 */
export const fillTimeSeriesGaps = (dataMap, startDate, endDate) => {
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        result.push({
            date: dateString,
            minutesSpent: dataMap[dateString] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
};

/**
 * Get aggregate data for distribution charts
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object>} - { byStatus, byCourse, totals }
 */
export const getAggregateData = async (studentId) => {
    // Get all enrollments
    const enrollments = await Enrollment.find({ student: studentId })
        .populate('course', 'title');

    // Calculate status distribution
    const byStatus = {
        not_started: 0,
        in_progress: 0,
        completed: 0
    };

    enrollments.forEach(enrollment => {
        byStatus[enrollment.status]++;
    });

    // Calculate time spent per course
    const byCourse = enrollments.map(enrollment => ({
        courseTitle: enrollment.course.title,
        timeSpent: enrollment.totalTimeSpent,
        progressPercentage: enrollment.progressPercentage
    }));

    // Calculate totals
    const totalCourses = enrollments.length;
    const totalTimeSpent = enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0);
    const totalLessonsCompleted = enrollments.reduce(
        (sum, e) => sum + e.completedLessons.length,
        0
    );

    return {
        byStatus,
        byCourse,
        totals: {
            totalCourses,
            totalTimeSpent,
            totalLessonsCompleted
        }
    };
};

export const getStudentDashboardCsv = async (studentId) => {
    const enrollments = await Enrollment.find({ student: studentId })
        .populate('course', 'title totalLessons totalDuration')
        .sort({ lastAccessedAt: -1 });

    const rows = enrollments.map(enrollment => ({
        courseTitle: enrollment.course?.title || 'Unknown course',
        status: enrollment.status,
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons.length,
        totalLessons: enrollment.course?.totalLessons || 0,
        totalTimeSpent: enrollment.totalTimeSpent,
        totalDuration: enrollment.course?.totalDuration || 0,
        lastAccessedAt: enrollment.lastAccessedAt
    }));

    return toCsv(rows, [
        { header: 'Course', value: row => row.courseTitle },
        { header: 'Status', value: row => row.status },
        { header: 'Progress %', value: row => row.progressPercentage },
        { header: 'Completed Lessons', value: row => row.completedLessons },
        { header: 'Total Lessons', value: row => row.totalLessons },
        { header: 'Time Spent Minutes', value: row => row.totalTimeSpent },
        { header: 'Course Duration Minutes', value: row => row.totalDuration },
        { header: 'Last Accessed At', value: row => row.lastAccessedAt }
    ]);
};
