import mongoose from 'mongoose';
import User from './User.js';

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Mentor is required']
        },
        thumbnail: {
            type: String,
            default: ''
        },
        totalLessons: {
            type: Number,
            default: 0,
            min: [0, 'Total lessons cannot be negative']
        },
        totalDuration: {
            type: Number, // in minutes
            default: 0,
            min: [0, 'Total duration cannot be negative']
        }
    },
    {
        timestamps: true
    }
);

// Create index on mentor field for efficient queries
courseSchema.index({ mentor: 1 });

// Pre-save hook to validate mentor role
courseSchema.pre('save', async function (next) {
    if (this.isModified('mentor')) {
        try {
            const mentor = await User.findById(this.mentor);
            if (!mentor) {
                throw new Error('Mentor user not found');
            }
            if (mentor.role !== 'mentor') {
                throw new Error('Referenced user must have mentor role');
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
