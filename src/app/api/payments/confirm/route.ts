import { connectDatabase } from '@/server/config/db';
import { stripe } from '@/server/config/stripe';
import { handleApiError, json } from '@/server/api-response';
import { requireUser, serializeUser } from '@/server/auth';
import { Payment } from '@/server/models';
import { confirmPaymentSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();

    if (!stripe) {
      throw new AppError(503, 'Stripe is not configured');
    }

    const data = confirmPaymentSchema.parse(await request.json());
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    if (session.payment_status !== 'paid' || session.metadata?.userId !== String(user._id)) {
      throw new AppError(400, 'Payment not completed');
    }

    const paymentType = session.metadata?.type === 'premium' ? 'premium' : 'recipe';
    const transactionId = session.payment_intent ? String(session.payment_intent) : session.id;

    const payment = await Payment.findOneAndUpdate(
      { checkoutSessionId: session.id },
      {
        userEmail: user.email,
        userId: user._id,
        amount: Number(session.amount_total || 0) / 100,
        recipeId: session.metadata?.recipeId || null,
        checkoutSessionId: session.id,
        transactionId,
        type: paymentType,
        paymentStatus: 'paid',
        paidAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (paymentType === 'premium' && !user.isPremium) {
      user.isPremium = true;
      await user.save();
    }

    return json({
      ok: true,
      payment,
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
