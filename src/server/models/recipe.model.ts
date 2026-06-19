import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const recipeSchema = new Schema(
  {
    recipeName: { type: String, required: true, trim: true },
    recipeImage: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    cuisineType: { type: String, required: true, trim: true },
    difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    preparationTime: { type: Number, required: true, min: 1 },
    ingredients: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    authorName: String,
    authorEmail: String,
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    price: { type: Number, default: 2.99, min: 0 },
  },
  { timestamps: true }
);

export type RecipeDocument = InferSchemaType<typeof recipeSchema> & { _id: mongoose.Types.ObjectId };

export const Recipe =
  (mongoose.models.Recipe as Model<RecipeDocument>) ||
  mongoose.model<RecipeDocument>('Recipe', recipeSchema);
