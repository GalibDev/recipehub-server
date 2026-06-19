import mongoose from 'mongoose';
import { AppError } from './utils/app-error';

export function assertObjectId(id: string, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, `Invalid ${label}`);
  }
}
