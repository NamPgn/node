import { Request, Response, NextFunction } from 'express';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: (req as any).user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    const message = 'File upload error';
    error = new AppError(message, 400);
  }

  // Default error response
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || 'Server Error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      }
    });
  }

  // Production error response
  return res.status(statusCode).json({
    success: false,
    error: {
      message: (error as AppError).isOperational ? message : 'Something went wrong',
      statusCode
    }
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Global unhandled promise rejection handler
export const handleUnhandledRejection = (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
};

// Global uncaught exception handler
export const handleUncaughtException = (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
};

export default errorHandler;
