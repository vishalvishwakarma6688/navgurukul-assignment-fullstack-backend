import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long']
        },
        role: {
            type: String,
            enum: {
                values: ['student', 'mentor'],
                message: '{VALUE} is not a valid role'
            },
            default: 'student'
        },
        avatar: {
            type: String,
            default: ''
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationCodeHash: {
            type: String,
            default: ''
        },
        emailVerificationExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Instance method to exclude password from JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.emailVerificationCodeHash;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
