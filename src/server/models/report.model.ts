import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const reportSchema = new Schema(
  {
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    reporterEmail: { type: String, required: true, trim: true },
    reason: {
      type: String,
      enum: ['Spam', 'Offensive Content', 'Copyright Issue'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'dismissed', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

export type ReportDocument = InferSchemaType<typeof reportSchema> & { _id: mongoose.Types.ObjectId };

export const Report =
  (mongoose.models.Report as Model<ReportDocument>) ||
  mongoose.model<ReportDocument>('Report', reportSchema);
