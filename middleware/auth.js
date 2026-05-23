import * as AuthService from '../services/AuthService.js';
import User from '../models/User.js';
import { AuthenticationError, AuthorizationError, TokenError } from '../utils/errors.js';

/**
 * Authenticate middleware - Verify JWT token and attach user to request
 * @throws {401} - Missing or invalid token
 */
export const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = await AuthService.verifyToken(token);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AuthenticationError('User not found');
        }

        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name
        };

        next();
    } catch (error) {
        if (error instanceof TokenError || error instanceof AuthenticationError) {
            return res.status(401).json({
                error: {
                    message: error.message,
                    code: 'AUTHENTICATION_ERROR'
                }
            });
        }
        next(error);
    }
};

/**
 * Authorize middleware factory - Verify user has required role
 * @param {...string} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware
 * @throws {403} - Insufficient permissions
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new AuthorizationError(
                    `Access denied. Required role: ${allowedRoles.join(' or ')}`
                );
            }

            next();
        } catch (error) {
            if (error instanceof AuthorizationError) {
                return res.status(403).json({
                    error: {
                        message: error.message,
                        code: 'AUTHORIZATION_ERROR'
                    }
                });
            }
            if (error instanceof AuthenticationError) {
                return res.status(401).json({
                    error: {
                        message: error.message,
                        code: 'AUTHENTICATION_ERROR'
                    }
                });
            }
            next(error);
        }
    };
};
