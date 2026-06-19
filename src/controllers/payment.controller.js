import { Payment, Recipe } from '../models/index.js';
import { env } from '../config/env.js';
import { stripe } from '../config/stripe.js';
import { AppError } from '../utils/app-error.js';
import { serializeUser } from '../utils/auth.js';
import { checkoutSchema, confirmPaymentSchema } from '../validations/payment.validation.js';

export async function createCheckoutSession(req, res) {
  if (!stripe) {
    throw new AppError(503, 'Stripe is not configured');
  }

  const data = checkoutSchema.parse(req.body);
  const recipe = data.recipeId ? await Recipe.findById(data.recipeId) : null;

  if (data.recipeId && !recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const membership = !recipe;

  if (recipe && String(recipe.authorId) === String(req.user._id)) {
    throw new AppError(400, 'You cannot purchase your own recipe');
  }

  if (recipe) {
    const existingPurchase = await Payment.exists({
      userId: req.user._id,
      recipeId: recipe._id,
      paymentStatus: 'paid',
    });

    if (existingPurchase) {
      throw new AppError(409, 'You already purchased this recipe');
    }
  }

  const amount = membership ? env.PREMIUM_PRICE : Math.round((recipe.price || 0) * 100);
  const name = membership ? 'RecipeHub Premium Membership' : recipe.recipeName;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name,
          },
        },
      },
    ],
    success_url: `${env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}${recipe ? `/recipes/${recipe._id}` : '/dashboard'}`,
    metadata: {
      userId: String(req.user._id),
      recipeId: recipe ? String(recipe._id) : '',
      type: membership ? 'premium' : 'recipe',
    },
  });

  return res.json({ url: session.url });
}

export async function confirmPayment(req, res) {
  if (!stripe) {
    throw new AppError(503, 'Stripe is not configured');
  }

  const data = confirmPaymentSchema.parse(req.body);
  const session = await stripe.checkout.sessions.retrieve(data.sessionId);

  if (session.payment_status !== 'paid' || session.metadata?.userId !== String(req.user._id)) {
    throw new AppError(400, 'Payment not completed');
  }

  const paymentType = session.metadata?.type === 'premium' ? 'premium' : 'recipe';
  const transactionId = session.payment_intent ? String(session.payment_intent) : session.id;

  const payment = await Payment.findOneAndUpdate(
    { checkoutSessionId: session.id },
    {
      userEmail: req.user.email,
      userId: req.user._id,
      amount: Number(session.amount_total || 0) / 100,
      recipeId: session.metadata?.recipeId || null,
      checkoutSessionId: session.id,
      transactionId,
      type: paymentType,
      paymentStatus: 'paid',
      paidAt: new Date(),
    },
    {
      upsert: true,
      new: true,
    }
  );

  if (session.metadata?.type === 'premium' && !req.user.isPremium) {
    req.user.isPremium = true;
    await req.user.save();
  }

  return res.json({
    ok: true,
    payment,
    user: serializeUser(req.user),
  });
}
