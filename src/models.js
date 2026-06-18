import mongoose from 'mongoose';

const opts = { timestamps: true };
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true },
  image: String, passwordHash: { type: String, select: false }, role: { type: String, enum: ['user','admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false }, isPremium: { type: Boolean, default: false }
}, opts);
const recipeSchema = new mongoose.Schema({
  recipeName: { type: String, required: true, trim: true }, recipeImage: { type: String, required: true },
  category: { type: String, required: true, index: true }, cuisineType: String,
  difficultyLevel: { type: String, enum: ['Easy','Medium','Hard'], default: 'Easy' }, preparationTime: Number,
  ingredients: [String], instructions: [String], authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  authorName: String, authorEmail: String, likesCount: { type: Number, default: 0 }, likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFeatured: { type: Boolean, default: false }, status: { type: String, enum: ['published','hidden'], default: 'published' },
  price: { type: Number, default: 2.99 }
}, opts);
const favoriteSchema = new mongoose.Schema({ userEmail: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, addedAt: { type: Date, default: Date.now } });
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
const reportSchema = new mongoose.Schema({ recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }, reporterEmail: String, reason: { type: String, enum: ['Spam','Offensive Content','Copyright Issue'] }, status: { type: String, enum: ['pending','dismissed','resolved'], default: 'pending' } }, opts);
const paymentSchema = new mongoose.Schema({ userEmail: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: Number, recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null }, transactionId: { type: String, unique: true }, paymentStatus: { type: String, default: 'paid' }, paidAt: { type: Date, default: Date.now } }, opts);

export const User = mongoose.model('User', userSchema);
export const Recipe = mongoose.model('Recipe', recipeSchema);
export const Favorite = mongoose.model('Favorite', favoriteSchema);
export const Report = mongoose.model('Report', reportSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
