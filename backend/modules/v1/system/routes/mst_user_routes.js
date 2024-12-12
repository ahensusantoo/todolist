import express from "express";
import { get_mst_user_all} from "../controllers/mst_user_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').get(authenticateToken, get_mst_user_all)
// .post(authenticateToken,validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


export default router