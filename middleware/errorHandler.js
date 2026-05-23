import mongoose from 'mongoose';
import {
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    ExternalServiceError,
    NotFoundError,
    TokenError,
    ValidationError
} from '../utils/errors.js';

const getErrorResponse = (error) => {
    if (error instanceof ValidationError || error instanceof mongoose.Error.ValidationError) {
        return {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.details || null
        };
    }

    if (error instanceof AuthenticationError || error instanceof TokenError) {
        return {
            status: 401,
            code: 'AUTHENTICATION_ERROR',
            message: error.message
        };
    }

    if (error instanceof AuthorizationError) {
        return {
            status: 403,
            code: 'AUTHORIZATION_ERROR',
            message: error.message
        };
    }

    if (error instanceof NotFoundError) {
        return {
            status: 404,
            code: 'NOT_FOUND',
            message: error.message
        };
    }

    if (error instanceof ConflictError || error.code === 11000) {
        return {
            status: 409,
            code: 'CONFLICT',
            message: error.message || 'Resource conflict'
        };
    }

    if (error instanceof ExternalServiceError) {
        return {
            status: 502,
            code: 'EXTERNAL_SERVICE_ERROR',
            message: error.message
        };
    }

    if (error instanceof mongoose.Error.CastError) {
        return {
            status: 400,
            code: 'INVALID_ID',
            message: `Invalid ${error.path}`
        };
    }

    return {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    };
};

export const errorHandler = (error, req, res, next) => {
    const response = getErrorResponse(error);

    if (response.status === 500) {
        console.error(error);
    }

    return res.status(response.status).json({
        error: {
            message: response.message,
            code: response.code,
            ...(response.details ? { details: response.details } : {})
        }
    });
};
