import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        }
    });
};
