import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
