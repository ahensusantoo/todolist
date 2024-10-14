import express from "express";
import { get_mst_aplikasi_all} from "../controllers/mst_aplikasi_controller.js";
import { get_mst_group_all, count_mst_group } from "../controllers/mst_group_controller.js";
import { get_mst_modules_all} from "../controllers/mst_modules_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').get(authenticateToken, get_mst_aplikasi_all)
// .post(authenticateToken,validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


// mst_group
router.route('/').get(get_mst_group_all);
// Rute untuk menghitung jumlah grup
router.route('/count').get(count_mst_group);


//mst_modules
router.route('/').get(authenticateToken, get_mst_modules_all)



export default router