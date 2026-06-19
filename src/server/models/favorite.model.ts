import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const favoriteSchema = new Schema({
  userEmail: { type: String, required: true, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  addedAt: { type: Date, default: Date.now },
});

favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export type FavoriteDocument = InferSchemaType<typeof favoriteSchema> & { _id: mongoose.Types.ObjectId };

export const Favorite =
  (mongoose.models.Favorite as Model<FavoriteDocument>) ||
  mongoose.model<FavoriteDocument>('Favorite', favoriteSchema);
