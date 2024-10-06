import express from "express";
import { get_mst_group_all, validate_mst_group  } from "../controllers/mst_group_controller.js";
import {authenticateToken} from '../../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').get(authenticateToken, get_mst_group_all)
// .post(authenticateToken,validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


export default router