/**
 * Custom error constructors for consistent error handling
 */

const captureStackTrace = (error, constructor) => {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(error, constructor);
    }
};

export function ValidationError(message, details = null) {
    this.name = 'ValidationError';
    this.message = message;
    this.details = details;
    captureStackTrace(this, ValidationError);
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export function AuthenticationError(message = 'Authentication failed') {
    this.name = 'AuthenticationError';
    this.message = message;
    captureStackTrace(this, AuthenticationError);
}
AuthenticationError.prototype = Object.create(Error.prototype);
AuthenticationError.prototype.constructor = AuthenticationError;

export function AuthorizationError(message = 'You do not have permission to perform this action') {
    this.name = 'AuthorizationError';
    this.message = message;
    captureStackTrace(this, AuthorizationError);
}
AuthorizationError.prototype = Object.create(Error.prototype);
AuthorizationError.prototype.constructor = AuthorizationError;

export function NotFoundError(message = 'Resource not found') {
    this.name = 'NotFoundError';
    this.message = message;
    captureStackTrace(this, NotFoundError);
}
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

export function ConflictError(message = 'Resource conflict') {
    this.name = 'ConflictError';
    this.message = message;
    captureStackTrace(this, ConflictError);
}
ConflictError.prototype = Object.create(Error.prototype);
ConflictError.prototype.constructor = ConflictError;

export function TokenError(message = 'Invalid or expired token') {
    this.name = 'TokenError';
    this.message = message;
    captureStackTrace(this, TokenError);
}
TokenError.prototype = Object.create(Error.prototype);
TokenError.prototype.constructor = TokenError;

export function ExternalServiceError(message = 'External service request failed') {
    this.name = 'ExternalServiceError';
    this.message = message;
    captureStackTrace(this, ExternalServiceError);
}
ExternalServiceError.prototype = Object.create(Error.prototype);
ExternalServiceError.prototype.constructor = ExternalServiceError;
