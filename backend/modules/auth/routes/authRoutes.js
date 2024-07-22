import express from "express";
import { login, ValidasiLogin } from "../controllers/authControllers.js";
import {authenticateToken} from '../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/').post(authenticateToken,ValidasiLogin(), login)


export default router