import express from "express";
import { get_mst_group_all, count_mst_group } from "../controllers/mst_group_controller.js";
import { authenticateToken } from '../../../../middleware/authMiddleware.js';

const router = express.Router(); // Ganti express() menjadi express.Router()

// Menggunakan middleware untuk semua rute
router.use(authenticateToken);

// Rute untuk mendapatkan data grup
router.route('/').get(get_mst_group_all);

// Rute untuk menghitung jumlah grup
router.route('/count').get(count_mst_group);

// Rute lainnya bisa ditambahkan di sini
// .post(authenticateToken, validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)

export default router;
