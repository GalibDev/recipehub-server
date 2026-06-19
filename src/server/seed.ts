import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

config({ path: '.env.local', quiet: true });

async function main() {
  const { connectDatabase } = await import('./config/db');
  const { Favorite, Payment, Recipe, Report, User } = await import('./models');

  await connectDatabase();

  const userPasswordHash = await bcrypt.hash('Recipe123', 12);
  const adminPasswordHash = await bcrypt.hash('Admin123', 12);

  await User.bulkWrite([
  {
    updateOne: {
      filter: { email: 'admin@recipehub.dev' },
      update: {
        $set: {
          name: 'Admin User',
          email: 'admin@recipehub.dev',
          passwordHash: adminPasswordHash,
          role: 'admin',
          isPremium: true,
          isBlocked: false,
          image: 'https://i.pravatar.cc/200?img=12',
        },
      },
      upsert: true,
    },
  },
  {
    updateOne: {
      filter: { email: 'chef@recipehub.dev' },
      update: {
        $set: {
          name: 'Sarah Johnson',
          email: 'chef@recipehub.dev',
          passwordHash: userPasswordHash,
          role: 'user',
          isPremium: true,
          isBlocked: false,
          image: 'https://i.pravatar.cc/200?img=47',
        },
      },
      upsert: true,
    },
  },
  {
    updateOne: {
      filter: { email: 'rafi@recipehub.dev' },
      update: {
        $set: {
          name: 'Rafi Ahmed',
          email: 'rafi@recipehub.dev',
          passwordHash: userPasswordHash,
          role: 'user',
          isPremium: false,
          isBlocked: false,
          image: 'https://i.pravatar.cc/200?img=15',
        },
      },
      upsert: true,
    },
  },
  ]);

  const [admin, chef, rafi] = await Promise.all([
    User.findOne({ email: 'admin@recipehub.dev' }).orFail(),
    User.findOne({ email: 'chef@recipehub.dev' }).orFail(),
    User.findOne({ email: 'rafi@recipehub.dev' }).orFail(),
  ]);

  const seeds = [
  ['Creamy Garlic Pasta', 'photo-1621996346565-e3dbc646d9a9', 'Dinner', 'Italian', 'Easy', 25, 1240, true],
  ['Beef Steak', 'photo-1546833999-b9f581a1996d', 'Main Course', 'American', 'Medium', 38, 1186, true],
  ['Sushi Rolls', 'photo-1579871494447-9811cf80d66c', 'Japanese', 'Japanese', 'Hard', 55, 1110, true],
  ['Butter Chicken', 'photo-1603894584373-5ac82b2ae398', 'Dinner', 'Indian', 'Medium', 45, 1042, true],
  ['Chocolate Cake', 'photo-1578985545062-69928b1d9587', 'Dessert', 'French', 'Medium', 60, 996, true],
  ['Margherita Pizza', 'photo-1574071318508-1cdbab80d002', 'Italian', 'Italian', 'Easy', 35, 930, false],
  ['Chicken Biryani', 'photo-1563379926898-05f4575a45d8', 'Indian', 'Indian', 'Hard', 70, 884, false],
  ['Grilled Salmon', 'photo-1467003909585-2f8a72700288', 'Seafood', 'Mediterranean', 'Easy', 28, 810, false],
  ['Caesar Salad', 'photo-1546793665-c74683f339c1', 'Healthy', 'Italian', 'Easy', 18, 752, false],
  ['Fluffy Pancakes', 'photo-1528207776546-365bb710ee93', 'Breakfast', 'American', 'Easy', 22, 695, false],
  ['Spicy Ramen', 'photo-1569718212165-3a8278d5f624', 'Japanese', 'Japanese', 'Medium', 48, 642, false],
  ['Tomato Soup', 'photo-1547592166-23ac45744acd', 'Healthy', 'International', 'Easy', 30, 588, false],
  ['Bangladeshi Beef Tehari', 'photo-1601050690597-df0568f70950', 'Bangladeshi', 'Bangladeshi', 'Medium', 65, 520, false],
  ['Mango Lassi', 'photo-1627308595229-7830a5c91f9f', 'Drinks', 'Indian', 'Easy', 10, 476, false],
  ['Thai Green Curry', 'photo-1455619452474-d2be8b1e70cd', 'Dinner', 'Thai', 'Medium', 40, 444, false],
  ['Avocado Toast', 'photo-1541519227354-08fa5d50c44d', 'Breakfast', 'International', 'Easy', 12, 390, false],
] as const;

  await Recipe.bulkWrite(
    seeds.map(([recipeName, imageId, category, cuisineType, difficultyLevel, preparationTime, likesCount, isFeatured], index) => {
      const author = index % 5 === 0 ? rafi : chef;

      return {
        updateOne: {
          filter: { recipeName },
          update: {
            $set: {
              recipeName,
              recipeImage: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1000&q=85`,
              category,
              cuisineType,
              difficultyLevel,
              preparationTime,
              ingredients: ['Fresh ingredients', 'Olive oil', 'Sea salt', 'Herbs and spices'],
              instructions: ['Prepare ingredients.', 'Cook until fragrant.', 'Season and serve warm.'],
              authorId: author._id,
              authorName: author.name,
              authorEmail: author.email,
              likedBy: [admin._id, rafi._id],
              likesCount,
              isFeatured,
              status: index === 15 ? 'hidden' : 'published',
              price: index % 4 === 0 ? 3.99 : 2.99,
            },
          },
          upsert: true,
        },
      };
    })
  );

  const butterChicken = await Recipe.findOne({ recipeName: 'Butter Chicken' }).orFail();
  const spicyRamen = await Recipe.findOne({ recipeName: 'Spicy Ramen' }).orFail();

  await Favorite.updateOne(
    { userId: rafi._id, recipeId: butterChicken._id },
    { $set: { userEmail: rafi.email, userId: rafi._id, recipeId: butterChicken._id, addedAt: new Date() } },
    { upsert: true }
  );

  await Report.updateOne(
    { recipeId: spicyRamen._id, reporterEmail: rafi.email, status: 'pending' },
    { $set: { recipeId: spicyRamen._id, reporterEmail: rafi.email, reason: 'Spam', status: 'pending' } },
    { upsert: true }
  );

  await Payment.updateOne(
    { checkoutSessionId: 'cs_test_recipehub_seed_premium_rafi' },
    {
      $set: {
        userEmail: rafi.email,
        userId: rafi._id,
        amount: 9.99,
        recipeId: null,
        checkoutSessionId: 'cs_test_recipehub_seed_premium_rafi',
        transactionId: 'pi_test_recipehub_seed_premium_rafi',
        type: 'premium',
        paymentStatus: 'paid',
        paidAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log('Seed complete');
  console.log('Admin login: admin@recipehub.dev / Admin123');
  console.log('User login: rafi@recipehub.dev / Recipe123');
  console.log('Premium chef login: chef@recipehub.dev / Recipe123');

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
