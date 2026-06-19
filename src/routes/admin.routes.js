import { Router } from 'express';
import {
  getAdminRecipes,
  getAdminStats,
  getPayments,
  getReports,
  getUsers,
  updateRecipeFeature,
  updateRecipeStatus,
  updateReport,
  updateUserBlock,
  updateUserRole,
} from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken, verifyAdmin);
router.get('/stats', asyncHandler(getAdminStats));
router.get('/users', asyncHandler(getUsers));
router.patch('/users/:id/block', asyncHandler(updateUserBlock));
router.patch('/users/:id/role', asyncHandler(updateUserRole));
router.get('/recipes', asyncHandler(getAdminRecipes));
router.patch('/recipes/:id/feature', asyncHandler(updateRecipeFeature));
router.patch('/recipes/:id/status', asyncHandler(updateRecipeStatus));
router.get('/reports', asyncHandler(getReports));
router.patch('/reports/:id', asyncHandler(updateReport));
router.get('/payments', asyncHandler(getPayments));

export default router;
