import express from "express";
import { get_mst_group_all, count_mst_group, create_mst_group, validate_mst_group, get_mst_group_by_id } from "../controllers/mst_group_controller.js";
import { authenticateToken } from '../../../../middleware/authMiddleware.js';

const router = express.Router(); // Ganti express() menjadi express.Router()

// Menggunakan middleware untuk semua rute
router.use(authenticateToken);

// Rute untuk mendapatkan data grup
router.route('/').get(get_mst_group_all).post(authenticateToken,validate_mst_group(), create_mst_group);
router.route('/count').get(count_mst_group);
router.route('/:id').get(authenticateToken, get_mst_group_by_id)

// Rute lainnya bisa ditambahkan di sini
// .post(authenticateToken, validateUser(), createUser)
// router.route('/:id').post(authenticateToken, detailUser).put(authenticateToken, validateUser(true), updateUser).delete(authenticateToken, deleteUser)

export default router;
