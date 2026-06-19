import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { env } from './config/env';
import { AppError } from './utils/app-error';

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return json(
      {
        message: error.issues[0]?.message || 'Validation failed',
        issues: error.issues,
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return json({ message: error.message }, { status: error.statusCode });
  }

  if (error instanceof mongoose.Error.CastError) {
    return json({ message: 'Invalid resource id' }, { status: 400 });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return json(
      {
        message: 'Validation failed',
        issues: Object.values(error.errors).map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const maybeMongoError = error as { code?: number; keyPattern?: Record<string, unknown> };

  if (maybeMongoError?.code === 11000) {
    return json(
      {
        message: 'Resource already exists',
        fields: Object.keys(maybeMongoError.keyPattern || {}),
      },
      { status: 409 }
    );
  }

  const message =
    env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : error instanceof Error
        ? error.message
        : 'Something went wrong';

  return json({ message }, { status: 500 });
}
