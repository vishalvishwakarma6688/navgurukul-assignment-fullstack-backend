import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import ActivityLog from '../models/ActivityLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-dashboard';


const seed = async () => {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await Promise.all([
        User.deleteMany({}),
        Course.deleteMany({}),
        Lesson.deleteMany({}),
        Enrollment.deleteMany({}),
        ActivityLog.deleteMany({})
    ]);
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    const [mentor, student1, student2] = await User.insertMany([
        { name: 'Alex Mentor', email: 'mentor@example.com', password: hashedPassword, role: 'mentor', isEmailVerified: true },
        { name: 'Jane Student', email: 'student1@example.com', password: hashedPassword, role: 'student', isEmailVerified: true },
        { name: 'Bob Student', email: 'student2@example.com', password: hashedPassword, role: 'student', isEmailVerified: true }
    ]);
    console.log('Created users');

    // Create courses (bypass pre-save hook by using updateOne after insert)
    const course1 = await Course.create({ title: 'JavaScript Fundamentals', description: 'Learn JS from scratch', mentor: mentor._id, thumbnail: 'https://placehold.co/400x200/6366f1/white?text=JS', totalLessons: 0, totalDuration: 0 });
    const course2 = await Course.create({ title: 'React & Modern Frontend', description: 'Build modern UIs with React', mentor: mentor._id, thumbnail: 'https://placehold.co/400x200/06b6d4/white?text=React', totalLessons: 0, totalDuration: 0 });
    const course3 = await Course.create({ title: 'Node.js & Express API', description: 'Build REST APIs with Node', mentor: mentor._id, thumbnail: 'https://placehold.co/400x200/10b981/white?text=Node', totalLessons: 0, totalDuration: 0 });
    console.log('Created courses');

    // Create lessons for course 1
    const c1Lessons = await Lesson.insertMany([
        { course: course1._id, title: 'Variables & Data Types', duration: 20, order: 1 },
        { course: course1._id, title: 'Functions & Scope', duration: 25, order: 2 },
        { course: course1._id, title: 'Arrays & Objects', duration: 30, order: 3 },
        { course: course1._id, title: 'Async JavaScript', duration: 35, order: 4 },
        { course: course1._id, title: 'ES6+ Features', duration: 30, order: 5 }
    ]);

    // Create lessons for course 2
    const c2Lessons = await Lesson.insertMany([
        { course: course2._id, title: 'React Basics & JSX', duration: 25, order: 1 },
        { course: course2._id, title: 'Components & Props', duration: 30, order: 2 },
        { course: course2._id, title: 'State & Hooks', duration: 35, order: 3 },
        { course: course2._id, title: 'React Query', duration: 30, order: 4 }
    ]);

    // Create lessons for course 3
    const c3Lessons = await Lesson.insertMany([
        { course: course3._id, title: 'Node.js Intro', duration: 20, order: 1 },
        { course: course3._id, title: 'Express Routing', duration: 25, order: 2 },
        { course: course3._id, title: 'MongoDB & Mongoose', duration: 35, order: 3 },
        { course: course3._id, title: 'Authentication', duration: 40, order: 4 },
        { course: course3._id, title: 'Deployment', duration: 30, order: 5 },
        { course: course3._id, title: 'Testing APIs', duration: 25, order: 6 }
    ]);

    // Update course totals
    await Course.findByIdAndUpdate(course1._id, { totalLessons: 5, totalDuration: 140 });
    await Course.findByIdAndUpdate(course2._id, { totalLessons: 4, totalDuration: 120 });
    await Course.findByIdAndUpdate(course3._id, { totalLessons: 6, totalDuration: 175 });
    console.log('Created lessons');

    // Enrollments for student1: course1 completed, course2 in_progress, course3 not_started
    const enroll1 = await Enrollment.create({
        student: student1._id, course: course1._id,
        completedLessons: c1Lessons.map(l => l._id),
        progressPercentage: 100, totalTimeSpent: 140, status: 'completed',
        lastAccessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const enroll2 = await Enrollment.create({
        student: student1._id, course: course2._id,
        completedLessons: [c2Lessons[0]._id, c2Lessons[1]._id],
        progressPercentage: 50, totalTimeSpent: 55, status: 'in_progress',
        lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const enroll3 = await Enrollment.create({
        student: student1._id, course: course3._id,
        completedLessons: [], progressPercentage: 0, totalTimeSpent: 0, status: 'not_started',
        lastAccessedAt: new Date()
    });

    // Enrollments for student2: course2 in_progress, course3 in_progress
    const enroll4 = await Enrollment.create({
        student: student2._id, course: course2._id,
        completedLessons: [c2Lessons[0]._id],
        progressPercentage: 25, totalTimeSpent: 25, status: 'in_progress',
        lastAccessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    const enroll5 = await Enrollment.create({
        student: student2._id, course: course3._id,
        completedLessons: [c3Lessons[0]._id, c3Lessons[1]._id, c3Lessons[2]._id],
        progressPercentage: 50, totalTimeSpent: 80, status: 'in_progress',
        lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    console.log('Created enrollments');

    // Activity logs spanning 35 days for student1
    const activityLogs = [];
    const now = new Date();

    for (let i = 35; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        if (i % 2 === 0) {
            activityLogs.push({
                student: student1._id, course: course1._id,
                lesson: c1Lessons[Math.floor(Math.random() * c1Lessons.length)]._id,
                activityType: 'time_spent',
                minutesSpent: Math.floor(Math.random() * 40) + 10,
                activityDate: date
            });
        }
        if (i % 3 === 0) {
            activityLogs.push({
                student: student1._id, course: course2._id,
                lesson: c2Lessons[Math.floor(Math.random() * c2Lessons.length)]._id,
                activityType: 'time_spent',
                minutesSpent: Math.floor(Math.random() * 30) + 15,
                activityDate: date
            });
        }
    }

    // Lesson completed events for student1
    for (const lesson of c1Lessons) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        activityLogs.push({ student: student1._id, course: course1._id, lesson: lesson._id, activityType: 'lesson_completed', minutesSpent: 0, activityDate: d });
    }
    activityLogs.push({ student: student1._id, course: course1._id, activityType: 'course_completed', minutesSpent: 0, activityDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) });

    for (const lesson of [c2Lessons[0], c2Lessons[1]]) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 10));
        activityLogs.push({ student: student1._id, course: course2._id, lesson: lesson._id, activityType: 'lesson_completed', minutesSpent: 0, activityDate: d });
    }

    // Activity logs for student2
    for (let i = 20; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        if (i % 2 === 0) {
            activityLogs.push({
                student: student2._id, course: course3._id,
                lesson: c3Lessons[Math.floor(Math.random() * 3)]._id,
                activityType: 'time_spent',
                minutesSpent: Math.floor(Math.random() * 35) + 10,
                activityDate: date
            });
        }
    }

    await ActivityLog.insertMany(activityLogs);
    console.log('Created activity logs');

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Login credentials:');
    console.log('  Mentor  → mentor@example.com   / password123');
    console.log('  Student → student1@example.com / password123');
    console.log('  Student → student2@example.com / password123');
    console.log('─────────────────────────────────');

    await mongoose.disconnect();
};

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
