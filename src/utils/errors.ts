// Import error classes from errorHandler
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException
} from '../middlewares/errorHandler';

// Re-export all error classes and utilities
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException
};

// Additional utility functions
export const throwError = (message: string, statusCode: number = 500) => {
  throw new AppError(message, statusCode);
};

export const throwValidationError = (message: string) => {
  throw new ValidationError(message);
};

export const throwNotFoundError = (message: string = 'Resource not found') => {
  throw new NotFoundError(message);
};

export const throwAuthenticationError = (message: string = 'Authentication failed') => {
  throw new AuthenticationError(message);
};

export const throwAuthorizationError = (message: string = 'Access denied') => {
  throw new AuthorizationError(message);
};

export const throwConflictError = (message: string = 'Resource conflict') => {
  throw new ConflictError(message);
};
