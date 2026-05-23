import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required']
        },
        title: {
            type: String,
            required: [true, 'Lesson title is required'],
            trim: true
        },
        duration: {
            type: Number, // in minutes
            default: 0,
            min: [0, 'Duration cannot be negative']
        },
        order: {
            type: Number,
            default: 1,
            min: [1, 'Order must be at least 1']
        }
    },
    {
        timestamps: true
    }
);

// Create compound index on (course, order) for efficient ordered retrieval
lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
