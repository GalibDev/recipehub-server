import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    recipeName: {
      type: String,
      required: true,
      trim: true,
    },
    recipeImage: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    cuisineType: {
      type: String,
      required: true,
      trim: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    preparationTime: {
      type: Number,
      required: true,
      min: 1,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    authorName: String,
    authorEmail: String,
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'hidden'],
      default: 'published',
    },
    price: {
      type: Number,
      default: 2.99,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Recipe = mongoose.model('Recipe', recipeSchema);
