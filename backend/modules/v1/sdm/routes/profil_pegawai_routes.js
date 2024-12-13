import express from "express";
import { get_profil_pegawai_all } from "../controllers/profil_pegawai_controller.js";
import { authenticateToken } from '../../../../middleware/authMiddleware.js';

const router = express.Router(); // Ganti express() menjadi express.Router()

// Menggunakan middleware untuk semua rute
router.use(authenticateToken);

// Rute untuk mendapatkan data grup
router.route('/').get(authenticateToken, get_profil_pegawai_all)


export default router;
