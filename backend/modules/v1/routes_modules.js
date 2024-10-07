import express from 'express';
import mst_aplikasi_routes from './master/routes/mst_aplikasi_routes.js';
import mst_group_routes from './master/routes/mst_group_routes.js';
import userRoutes from './master/routes/userRoutes.js';
import loginRoutes from './main/routes/mainRoutes.js';

const router = express.Router();


// folder master start
    router.use('/mst_aplikasi', mst_aplikasi_routes);
    router.use('/mst_group', mst_group_routes);
    router.use('/users', userRoutes);
// folder master end

// folder auth start
    router.use('/login', loginRoutes);
// folder auth end


export default router;
