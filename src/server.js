import { createApp } from './app.js';
import { env } from './config/env.js';

const app = await createApp();

app.listen(env.PORT, () => {
  console.log(`RecipeHub API running on ${env.PORT}`);
});
