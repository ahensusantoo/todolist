import express from "express";
import { get_mst_user_all, count_mst_user, get_mst_user_by_id} from "../controllers/mst_user_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').get(authenticateToken, get_mst_user_all)
// .post(authenticateToken,validateUser(), createUser)
router.route('/count').get(authenticateToken, count_mst_user)
router.route('/:id').get(authenticateToken, get_mst_user_by_id)
// .put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


export default router