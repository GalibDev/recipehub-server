import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: err.issues[0]?.message || 'Validation failed',
      issues: err.issues,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid resource id' });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Something went wrong';

  return res.status(statusCode).json({ message });
}
