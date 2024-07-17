import express from "express";
import { getUsers, detailUser, createUser, updateUser, deleteUser, validateUser  } from "../controllers/userControllers.js";
import {authenticateToken} from '../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);
// router.get('/', getUsers)

router.route('/').get(authenticateToken, getUsers).post(authenticateToken,validateUser(), createUser)
router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)


export default router