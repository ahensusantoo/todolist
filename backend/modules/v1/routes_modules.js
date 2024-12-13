import express from 'express';
const router = express.Router();


// SYSTEM START
    import mst_aplikasi_routes from './system/routes/mst_aplikasi_routes.js';
    import mst_user_routes from './system/routes/mst_user_routes.js';
    import mst_group_routes from './system/routes/mst_group_routes.js';
    import mst_modules_routes from './system/routes/mst_modules_routes.js';

    router.use('/system/mst_aplikasi', mst_aplikasi_routes);
    router.use('/system/mst_user', mst_user_routes);
    router.use('/system/mst_group', mst_group_routes);
    router.use('/system/mst_modules', mst_modules_routes);
// SYSTEM END

import userRoutes from './master/routes/userRoutes.js';
import loginRoutes from './main/routes/mainRoutes.js';




// folder master start
    
// folder master end

// folder auth start
    router.use('/login', loginRoutes);
// folder auth end



// folder sdm start
    import profil_pegawai_routes from './sdm/routes/profil_pegawai_routes.js';
    router.use('/sdm/profil_pegawai', profil_pegawai_routes);
// folder sdm end


export default router;
