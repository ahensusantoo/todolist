import express from 'express';
import mst_group_routes from './master/routes/mst_group_routes.js';
import userRoutes from './master/routes/userRoutes.js';
import loginRoutes from './main/routes/mainRoutes.js';

const router = express.Router();

router.use('/mst_group', mst_group_routes);
router.use('/users', userRoutes);
router.use('/login', loginRoutes);

export default router;
