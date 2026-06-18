# RecipeHub Server

Express and MongoDB API for RecipeHub, refactored into modular folders for configuration, controllers, middleware, models, routes, utilities, and validations.

## Structure

- `src/config`
- `src/controllers`
- `src/middleware`
- `src/models`
- `src/routes`
- `src/utils`
- `src/validations`

## Features

- Better Auth configuration driven by environment variables
- JWT authentication stored in an HTTPOnly cookie
- Verify token middleware and admin middleware
- Recipe CRUD endpoints
- Favorites, reports, and purchases APIs
- Stripe checkout session creation and payment confirmation
- Server-side pagination for list endpoints
- MongoDB `$in` filtering for recipe categories, cuisines, and difficulty
- Centralized validation and error handling

## Run locally

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Seed sample data with `npm run seed`.
4. Start the API with `npm run dev`.

Base URL: `http://localhost:5000/api`
