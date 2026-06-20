import { connectDatabase } from '@/server/config/db';
import { env } from '@/server/config/env';
import { stripe } from '@/server/config/stripe';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Payment, Recipe } from '@/server/models';
import { checkoutSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();

    if (!stripe) {
      throw new AppError(503, 'Stripe is not configured');
    }

    const data = checkoutSchema.parse(await request.json());
    const recipe = data.recipeId ? await Recipe.findById(data.recipeId) : null;

    if (data.recipeId && !recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    const membership = !recipe;

    if (membership && user.isPremium) {
      throw new AppError(409, 'You are already a premium member');
    }

    if (recipe && String(recipe.authorId) === String(user._id)) {
      throw new AppError(400, 'You cannot purchase your own recipe');
    }

    if (recipe) {
      const existingPurchase = await Payment.exists({
        userId: user._id,
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
            product_data: { name },
          },
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}${recipe ? `/recipes/${recipe._id}` : '/dashboard'}`,
      metadata: {
        userId: String(user._id),
        recipeId: recipe ? String(recipe._id) : '',
        type: membership ? 'premium' : 'recipe',
      },
    });

    return json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
