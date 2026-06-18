import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import { Recipe, User } from './models/index.js';

await connectDatabase();

const passwordHash = await bcrypt.hash('Recipe123', 12);
const adminPasswordHash = await bcrypt.hash('Admin123', 12);

const admin = await User.findOneAndUpdate(
  { email: 'admin@recipehub.dev' },
  {
    name: 'Admin User',
    email: 'admin@recipehub.dev',
    passwordHash: adminPasswordHash,
    role: 'admin',
    isPremium: true,
    image: 'https://i.pravatar.cc/200?img=12',
  },
  { upsert: true, new: true }
);

const chef = await User.findOneAndUpdate(
  { email: 'chef@recipehub.dev' },
  {
    name: 'Sarah Johnson',
    email: 'chef@recipehub.dev',
    passwordHash,
    isPremium: true,
    image: 'https://i.pravatar.cc/200?img=47',
  },
  { upsert: true, new: true }
);

if ((await Recipe.countDocuments()) === 0) {
  const names = [
    'Creamy Garlic Pasta',
    'Beef Steak',
    'Sushi Rolls',
    'Butter Chicken',
    'Chocolate Cake',
    'Margherita Pizza',
    'Chicken Biryani',
    'Grilled Salmon',
    'Caesar Salad',
    'Fluffy Pancakes',
    'Spicy Ramen',
    'Tomato Soup',
  ];

  const images = [
    'photo-1621996346565-e3dbc646d9a9',
    'photo-1546833999-b9f581a1996d',
    'photo-1579871494447-9811cf80d66c',
    'photo-1603894584373-5ac82b2ae398',
    'photo-1578985545062-69928b1d9587',
    'photo-1574071318508-1cdbab80d002',
    'photo-1563379926898-05f4575a45d8',
    'photo-1467003909585-2f8a72700288',
    'photo-1546793665-c74683f339c1',
    'photo-1528207776546-365bb710ee93',
    'photo-1569718212165-3a8278d5f624',
    'photo-1547592166-23ac45744acd',
  ];

  await Recipe.insertMany(
    names.map((recipeName, index) => ({
      recipeName,
      recipeImage: `https://images.unsplash.com/${images[index]}?auto=format&fit=crop&w=1000&q=85`,
      category: [
        'Dinner',
        'Main Course',
        'Japanese',
        'Dinner',
        'Dessert',
        'Italian',
        'Indian',
        'Seafood',
        'Healthy',
        'Breakfast',
        'Japanese',
        'Healthy',
      ][index],
      cuisineType: [
        'Italian',
        'American',
        'Japanese',
        'Indian',
        'French',
        'Italian',
        'Indian',
        'Mediterranean',
        'Italian',
        'American',
        'Japanese',
        'International',
      ][index],
      difficultyLevel: index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard',
      preparationTime: 20 + index * 3,
      ingredients: [
        'Fresh seasonal ingredients',
        'Olive oil',
        'Sea salt and black pepper',
        'Herbs and spices',
      ],
      instructions: [
        'Prepare and measure all ingredients.',
        'Cook gently until fragrant and golden.',
        'Combine, season to taste, and serve warm.',
      ],
      authorId: chef._id,
      authorName: chef.name,
      authorEmail: chef.email,
      likesCount: 1200 - index * 67,
      isFeatured: index < 5,
      price: 2.99,
    }))
  );
}

console.log('Seed complete');
await mongoose.disconnect();
