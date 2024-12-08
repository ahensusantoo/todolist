import express from "express";
import { get_mst_aplikasi_all} from "../controllers/mst_aplikasi_controller.js";
import { get_mst_group_all, count_mst_group, create_mst_group, validate_mst_group, get_mst_group_by_id } from "../controllers/mst_group_controller.js";
import { get_mst_modules_all} from "../controllers/mst_modules_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

// ======================//
//==== MASTER APLIKASI===//
// ======================//
router.route('/').get(authenticateToken, get_mst_aplikasi_all)
// .post(authenticateToken,validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


// ======================//
//==== MASTER GROUP =====//
// ======================//
router.route('/').get(authenticateToken, get_mst_group_all).post(authenticateToken,validate_mst_group(), create_mst_group);
router.route('/count').get(authenticateToken, count_mst_group);
router.route('/:id').post(authenticateToken, get_mst_group_by_id).put(authenticateToken, validate_mst_group(true), updateUser).delete(authenticateToken, deleteUser)


// ======================//
//==== MASTER MODULES ===//
// ======================//
router.route('/').get(authenticateToken, get_mst_modules_all)



export default router