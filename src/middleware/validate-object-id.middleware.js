import mongoose from 'mongoose';
import { AppError } from '../utils/app-error.js';

export function validateObjectId(...paramNames) {
  return (req, res, next) => {
    const invalidParam = paramNames.find(
      (paramName) => !mongoose.Types.ObjectId.isValid(req.params[paramName])
    );

    if (invalidParam) {
      return next(new AppError(400, `Invalid ${invalidParam}`));
    }

    return next();
  };
}
