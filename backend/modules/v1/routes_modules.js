import express from 'express';
const router = express.Router();


// SYSTEM START
    import mst_aplikasi_routes from './system/routes/mst_aplikasi_routes.js';
    import mst_group_routes from './system/routes/mst_group_routes.js';
    import mst_modules_routes from './system/routes/mst_modules_routes.js';

    router.use('/system/mst_aplikasi', mst_aplikasi_routes);
    router.use('/system/mst_group', mst_group_routes);
    router.use('/system/mst_modules', mst_modules_routes);
// SYSTEM END

import userRoutes from './master/routes/userRoutes.js';
import loginRoutes from './main/routes/mainRoutes.js';




// folder master start
    
    router.use('/users', userRoutes);
// folder master end

// folder auth start
    router.use('/login', loginRoutes);
// folder auth end


export default router;
