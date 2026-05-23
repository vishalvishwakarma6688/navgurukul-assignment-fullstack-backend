import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ActivityLog from '../models/ActivityLog.js';
import { toCsv } from '../utils/csv.js';

const formatCourseMetric = (course, enrollments) => {
    const totalStudents = enrollments.length;
    const totalTimeSpent = enrollments.reduce((sum, enrollment) => sum + enrollment.totalTimeSpent, 0);
    const completedStudents = enrollments.filter(enrollment => enrollment.status === 'completed').length;
    const averageProgress = totalStudents
        ? enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercentage, 0) / totalStudents
        : 0;

    return {
        id: course._id,
        title: course.title,
        totalLessons: course.totalLessons,
        totalDuration: course.totalDuration,
        totalStudents,
        completedStudents,
        activeStudents: enrollments.filter(enrollment => enrollment.status === 'in_progress').length,
        totalTimeSpent,
        averageProgress: Math.round(averageProgress * 100) / 100
    };
};

export const getMentorDashboard = async (mentorId) => {
    const courses = await Course.find({ mentor: mentorId }).sort({ updatedAt: -1 });
    const courseIds = courses.map(course => course._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate('student', 'name email')
        .populate('course', 'title')
        .sort({ lastAccessedAt: -1 });

    const courseMetrics = courses.map(course => {
        const courseEnrollments = enrollments.filter(
            enrollment => enrollment.course?._id.toString() === course._id.toString()
        );
        return formatCourseMetric(course, courseEnrollments);
    });

    const totalStudents = new Set(
        enrollments.map(enrollment => enrollment.student?._id?.toString()).filter(Boolean)
    ).size;

    const recentActivity = await ActivityLog.find({ course: { $in: courseIds } })
        .populate('student', 'name email')
        .populate('course', 'title')
        .sort({ activityDate: -1 })
        .limit(8);

    return {
        summary: {
            totalCourses: courses.length,
            totalStudents,
            totalEnrollments: enrollments.length,
            totalTimeSpent: enrollments.reduce((sum, enrollment) => sum + enrollment.totalTimeSpent, 0),
            averageProgress: courseMetrics.length
                ? Math.round((courseMetrics.reduce((sum, metric) => sum + metric.averageProgress, 0) / courseMetrics.length) * 100) / 100
                : 0
        },
        courseMetrics,
        recentStudents: enrollments.slice(0, 10).map(enrollment => ({
            id: enrollment._id,
            studentName: enrollment.student?.name || 'Unknown student',
            studentEmail: enrollment.student?.email || '',
            courseTitle: enrollment.course?.title || 'Unknown course',
            status: enrollment.status,
            progressPercentage: enrollment.progressPercentage,
            totalTimeSpent: enrollment.totalTimeSpent,
            lastAccessedAt: enrollment.lastAccessedAt
        })),
        recentActivity: recentActivity.map(activity => ({
            id: activity._id,
            studentName: activity.student?.name || 'Unknown student',
            courseTitle: activity.course?.title || 'Unknown course',
            activityType: activity.activityType,
            minutesSpent: activity.minutesSpent,
            activityDate: activity.activityDate
        }))
    };
};

export const getMentorDashboardCsv = async (mentorId) => {
    const courses = await Course.find({ mentor: mentorId }).sort({ title: 1 });
    const courseIds = courses.map(course => course._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate('student', 'name email')
        .populate('course', 'title totalLessons totalDuration')
        .sort({ 'course.title': 1, lastAccessedAt: -1 });

    const rows = enrollments.map(enrollment => ({
        studentName: enrollment.student?.name || 'Unknown student',
        studentEmail: enrollment.student?.email || '',
        courseTitle: enrollment.course?.title || 'Unknown course',
        status: enrollment.status,
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons.length,
        totalLessons: enrollment.course?.totalLessons || 0,
        totalTimeSpent: enrollment.totalTimeSpent,
        lastAccessedAt: enrollment.lastAccessedAt
    }));

    return toCsv(rows, [
        { header: 'Student Name', value: row => row.studentName },
        { header: 'Student Email', value: row => row.studentEmail },
        { header: 'Course', value: row => row.courseTitle },
        { header: 'Status', value: row => row.status },
        { header: 'Progress %', value: row => row.progressPercentage },
        { header: 'Completed Lessons', value: row => row.completedLessons },
        { header: 'Total Lessons', value: row => row.totalLessons },
        { header: 'Time Spent Minutes', value: row => row.totalTimeSpent },
        { header: 'Last Accessed At', value: row => row.lastAccessedAt }
    ]);
};
