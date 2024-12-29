import express from "express";
import { 
    get_mst_user_all,
    count_mst_user,
    get_mst_user_by_id,
    validate_mst_user,
    create_mst_user,
    update_mst_user,
    delete_user} from "../controllers/mst_user_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').get(authenticateToken, get_mst_user_all).post(authenticateToken, validate_mst_user(), create_mst_user)
router.route('/count').get(authenticateToken, count_mst_user)
router.route('/:id').get(authenticateToken, get_mst_user_by_id).put(authenticateToken, validate_mst_user(true), update_mst_user).delete(authenticateToken, delete_user)


export default router