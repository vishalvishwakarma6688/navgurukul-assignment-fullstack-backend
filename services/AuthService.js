import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import * as EmailService from './EmailService.js';
import {
    ValidationError,
    AuthenticationError,
    ConflictError,
    ExternalServiceError,
    TokenError
} from '../utils/errors.js';

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const setVerificationCode = async (user) => {
    const code = generateVerificationCode();
    user.emailVerificationCodeHash = await hashPassword(code);
    user.emailVerificationExpiresAt = new Date(
        Date.now() + config.email.verificationMinutes * 60 * 1000
    );
    await user.save();
    return code;
};

const sendUserVerificationCode = async (user) => {
    const verificationCode = await setVerificationCode(user);
    await EmailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        code: verificationCode
    });
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, config.bcrypt.rounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Decoded token payload
 * @throws {TokenError} - Invalid or expired token
 */
export const verifyToken = async (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new TokenError('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new TokenError('Invalid token');
        }
        throw new TokenError('Token verification failed');
    }
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} - { user, token }
 * @throws {ValidationError} - Invalid email format or missing fields
 * @throws {ConflictError} - Duplicate email
 */
export const register = async (userData) => {
    const { name, email, password, role } = userData;

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        if (!existingUser.isEmailVerified) {
            existingUser.name = name;
            existingUser.password = await hashPassword(password);
            existingUser.role = role || existingUser.role || 'student';

            await sendUserVerificationCode(existingUser);

            return {
                user: existingUser.toJSON(),
                verificationRequired: true
            };
        }

        throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'student',
        isEmailVerified: false
    });

    try {
        await sendUserVerificationCode(user);
    } catch (error) {
        if (error instanceof ExternalServiceError) {
            await User.deleteOne({ _id: user._id });
        }
        throw error;
    }

    return {
        user: user.toJSON(),
        verificationRequired: true
    };
};

/**
 * Authenticate user and generate token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - { user, token }
 * @throws {AuthenticationError} - Invalid credentials
 */
export const login = async (email, password) => {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    if (user.isEmailVerified === false) {
        throw new AuthenticationError('Please verify your email before signing in');
    }

    // Generate token
    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    return {
        user: user.toJSON(),
        token
    };
};

/**
 * Verify a user's email using a one-time code.
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @returns {Promise<Object>} - { user, token }
 */
export const verifyEmail = async (email, code) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AuthenticationError('Invalid verification request');
    }

    if (user.isEmailVerified) {
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });
        return { user: user.toJSON(), token };
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
        throw new AuthenticationError('Verification code has expired');
    }

    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
        throw new AuthenticationError('Verification code has expired');
    }

    const isCodeValid = await comparePassword(code, user.emailVerificationCodeHash);
    if (!isCodeValid) {
        throw new AuthenticationError('Invalid verification code');
    }

    user.isEmailVerified = true;
    user.emailVerificationCodeHash = '';
    user.emailVerificationExpiresAt = null;
    await user.save();

    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    return { user: user.toJSON(), token };
};

/**
 * Resend a verification code for an unverified user.
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export const resendVerification = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AuthenticationError('Invalid verification request');
    }

    if (user.isEmailVerified) {
        return { message: 'Email is already verified' };
    }

    const verificationCode = await setVerificationCode(user);
    await EmailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        code: verificationCode
    });

    return { message: 'Verification code sent' };
};
