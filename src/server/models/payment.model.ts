import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const paymentSchema = new Schema(
  {
    userEmail: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', default: null },
    checkoutSessionId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, index: true },
    type: { type: String, enum: ['premium', 'recipe'], required: true },
    paymentStatus: { type: String, default: 'paid' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & { _id: mongoose.Types.ObjectId };

export const Payment =
  (mongoose.models.Payment as Model<PaymentDocument>) ||
  mongoose.model<PaymentDocument>('Payment', paymentSchema);
