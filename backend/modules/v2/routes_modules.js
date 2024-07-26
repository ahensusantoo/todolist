import express from 'express';
import userRoutes from './master/routes/userRoutes.js';
import authRoutes from './auth/routes/authRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export default router;
