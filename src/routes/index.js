import { Router } from 'express';
import authRoutes from './auth.routes.js';
import recipeRoutes from './recipe.routes.js';
import meRoutes from './me.routes.js';
import favoriteRoutes from './favorite.routes.js';
import reportRoutes from './report.routes.js';
import paymentRoutes from './payment.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/me', meRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;
