import express from 'express';
import userRoutes from './master/routes/userRoutes.js';
import loginRoutes from './main/routes/mainRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/login', loginRoutes);

export default router;
