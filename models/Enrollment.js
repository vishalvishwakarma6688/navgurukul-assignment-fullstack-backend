import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required']
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required']
        },
        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson'
            }
        ],
        progressPercentage: {
            type: Number,
            default: 0,
            min: [0, 'Progress percentage cannot be negative'],
            max: [100, 'Progress percentage cannot exceed 100']
        },
        totalTimeSpent: {
            type: Number, // in minutes
            default: 0,
            min: [0, 'Total time spent cannot be negative']
        },
        status: {
            type: String,
            enum: {
                values: ['not_started', 'in_progress', 'completed'],
                message: '{VALUE} is not a valid status'
            },
            default: 'not_started'
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Create compound unique index on (student, course) to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Create compound index on (student, lastAccessedAt) for dashboard queries
enrollmentSchema.index({ student: 1, lastAccessedAt: -1 });

// Virtual property for completion status
enrollmentSchema.virtual('isCompleted').get(function () {
    return this.status === 'completed';
});

// Ensure virtuals are included in JSON
enrollmentSchema.set('toJSON', { virtuals: true });
enrollmentSchema.set('toObject', { virtuals: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
