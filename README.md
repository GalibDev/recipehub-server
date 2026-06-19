# RecipeHub Server

Next.js TypeScript API server for RecipeHub. This repository no longer uses Express; backend endpoints are implemented with App Router route handlers under `src/app/api`.

## Stack

- Next.js App Router API routes
- TypeScript
- MongoDB + Mongoose
- Better Auth
- JWT stored in HTTPOnly cookies
- Stripe Checkout
- Zod validation

## Structure

- `src/app/api` - API route handlers
- `src/server/config` - env, MongoDB, Stripe, Better Auth config
- `src/server/models` - Mongoose models
- `src/server/utils` - pagination, query parsing, errors
- `src/server/validations.ts` - request validation schemas
- `src/server/seed.ts` - demo data seeder

## Environment

Copy `.env.example` to `.env.local`.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/recipehub
JWT_SECRET=replace-with-a-long-random-secret
JWT_COOKIE_NAME=recipehub_token
JWT_EXPIRES_IN=7d
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PREMIUM_PRICE=999
NODE_ENV=development
```

MongoDB credentials must stay in `MONGODB_URI`; no database secrets are hard-coded.

## Scripts

```bash
npm install
npm run seed
npm run dev
npm run build
npm start
```

## Demo Accounts

- Admin: `admin@recipehub.dev` / `Admin123`
- User: `rafi@recipehub.dev` / `Recipe123`
- Premium chef: `chef@recipehub.dev` / `Recipe123`

## API Coverage

- Auth: register, login, logout, session, Better Auth exchange
- Recipes: list, detail, create, update, delete, like
- Favorites: list, status, toggle, remove
- Reports: create, user report history
- Payments: Stripe checkout and confirmation
- Dashboard: recipes, favorites, purchases, profile, stats
- Admin: stats, users, recipe moderation, reports, transactions

Server-side pagination and MongoDB `$in` category filtering are implemented in API routes.
