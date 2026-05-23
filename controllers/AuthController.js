import * as AuthService from '../services/AuthService.js';
import User from '../models/User.js';
import { NotFoundError } from '../utils/errors.js';

export const register = async (req, res, next) => {
    try {
        const result = await AuthService.register(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const result = await AuthService.verifyEmail(email, code);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await AuthService.resendVerification(email);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return res.status(200).json({ user: user.toJSON() });
    } catch (error) {
        return next(error);
    }
};
