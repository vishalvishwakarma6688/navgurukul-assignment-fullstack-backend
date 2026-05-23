import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required']
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        activityType: {
            type: String,
            enum: {
                values: ['lesson_started', 'lesson_completed', 'time_spent', 'course_completed'],
                message: '{VALUE} is not a valid activity type'
            },
            required: [true, 'Activity type is required']
        },
        minutesSpent: {
            type: Number,
            default: 0,
            min: [0, 'Minutes spent cannot be negative']
        },
        activityDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Create compound index on (student, activityDate) for time series queries
activityLogSchema.index({ student: 1, activityDate: -1 });

// Create compound index on (student, course) for course-specific activity queries
activityLogSchema.index({ student: 1, course: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
