export class ValidationError extends Error {
    statusCode = 400;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends Error {
    statusCode = 404;
    isOperational = true;
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
export class DatabaseError extends Error {
    statusCode = 500;
    isOperational = true;
    constructor(message = 'Database operation failed') {
        super(message);
        this.name = 'DatabaseError';
    }
}
export const errorHandler = (err, req, res, _next) => {
    const { statusCode = 500, message, isOperational = false } = err;
    // Log error for debugging
    console.error('Error occurred:', {
        message,
        statusCode,
        isOperational,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Don't leak error details in production unless it's operational
    const errorMessage = process.env.NODE_ENV === 'production' && !isOperational
        ? 'Internal server error'
        : message;
    res.status(statusCode).json({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
