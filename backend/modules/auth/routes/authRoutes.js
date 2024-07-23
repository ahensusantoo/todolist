import express from "express";
import { login, ValidasiLogin } from "../controllers/authControllers.js";
import { authenticateToken } from '../../../middleware/authMiddleware.js';


const router = express();

router.use(authenticateToken);

router.route('/login').post(authenticateToken,ValidasiLogin(), login)
// router.route('/registrasi').post(authenticateToken,ValidasiLogin(), registrasi)


export default router