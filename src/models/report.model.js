import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      enum: ['Spam', 'Offensive Content', 'Copyright Issue'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'dismissed', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
