import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      default: 'paid',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
