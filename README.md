# RecipeHub Server

Express + MongoDB API for RecipeHub. The backend is organized into assignment-friendly folders for routes, controllers, models, middleware, utilities, validation, and config.

## Tech Stack

- Express 5
- MongoDB + Mongoose
- Better Auth for social/session integration
- JWT auth stored in an HTTPOnly cookie
- Stripe Checkout
- Zod validation

## Folder Structure

- `src/config` - environment, MongoDB, Better Auth, Stripe
- `src/controllers` - request handlers and business logic
- `src/middleware` - auth, admin, errors, not found, ObjectId checks
- `src/models` - Mongoose schemas
- `src/routes` - Express route modules
- `src/utils` - auth cookies, pagination, query parsing, async helpers
- `src/validations` - Zod request schemas

## Environment

Copy `.env.example` to `.env` and update the values.

```env
PORT=5000
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=
MONGODB_URI=mongodb://127.0.0.1:27017/recipehub
JWT_SECRET=replace-with-a-long-random-secret
JWT_COOKIE_NAME=recipehub_token
JWT_EXPIRES_IN=7d
COOKIE_SECRET=replace-with-a-long-random-secret
COOKIE_DOMAIN=
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_TRUSTED_ORIGINS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PREMIUM_PRICE=999
NODE_ENV=development
```

MongoDB credentials must live inside `MONGODB_URI`; do not hard-code database usernames or passwords.

## Scripts

```bash
npm install
npm run seed
npm run dev
npm start
```

Base API URL: `http://localhost:5000/api`

## Main Endpoints

- `POST /api/auth/register` - register and set JWT HTTPOnly cookie
- `POST /api/auth/login` - login and set JWT HTTPOnly cookie
- `POST /api/auth/logout` - clear auth cookie
- `GET /api/auth/session` - verify token and return current user
- `POST /api/auth/exchange` - exchange Better Auth session for app JWT cookie
- `GET /api/recipes` - paginated recipes with search, sort, featured, category `$in`, cuisine `$in`, difficulty `$in`
- `GET /api/recipes/:id` - recipe details
- `POST /api/recipes` - create recipe
- `PATCH /api/recipes/:id` - update own recipe or admin update
- `DELETE /api/recipes/:id` - delete own recipe or admin delete
- `POST /api/recipes/:id/like` - toggle recipe like
- `GET /api/favorites` - paginated favorites
- `GET /api/favorites/:recipeId` - favorite status
- `POST /api/favorites/:recipeId` - toggle favorite
- `DELETE /api/favorites/:recipeId` - remove favorite
- `GET /api/reports/mine` - paginated current user reports
- `POST /api/reports` - report a recipe
- `POST /api/payments/checkout` - create Stripe Checkout session
- `POST /api/payments/confirm` - confirm Stripe payment idempotently
- `GET /api/me/recipes` - current user recipes
- `GET /api/me/favorites` - current user favorites
- `GET /api/me/purchases` - current user purchases
- `GET /api/me/stats` - current user dashboard stats
- `PATCH /api/me/profile` - update profile
- `GET /api/admin/stats` - admin stats
- `GET /api/admin/users` - paginated users
- `PATCH /api/admin/users/:id/block` - block or unblock user
- `PATCH /api/admin/users/:id/role` - update user role
- `GET /api/admin/recipes` - paginated admin recipes
- `PATCH /api/admin/recipes/:id/feature` - feature or unfeature recipe
- `PATCH /api/admin/recipes/:id/status` - publish or hide recipe
- `GET /api/admin/reports` - paginated reports
- `PATCH /api/admin/reports/:id` - update report status
- `GET /api/admin/payments` - paginated transactions

## Security Notes

- JWTs are signed with `JWT_SECRET` and stored in `JWT_COOKIE_NAME` as HTTPOnly cookies.
- Protected routes use `verifyToken`.
- Admin routes use both `verifyToken` and `verifyAdmin`.
- Better Auth secrets, base URL, trusted origins, and OAuth credentials are env-driven.
- Stripe secret keys are read from env and never committed.
- Validation and centralized error middleware provide consistent API errors.
