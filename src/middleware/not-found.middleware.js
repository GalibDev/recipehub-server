import { AppError } from '../utils/app-error.js';

export function notFound(req, res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
}
