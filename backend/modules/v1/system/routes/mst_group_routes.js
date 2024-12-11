import express from "express";
import { get_mst_group_all, count_mst_group, create_mst_group, update_mst_group, delete_mst_group, validate_mst_group, get_mst_group_by_id } from "../controllers/mst_group_controller.js";
import { authenticateToken } from '../../../../middleware/authMiddleware.js';

const router = express.Router(); // Ganti express() menjadi express.Router()

// Menggunakan middleware untuk semua rute
router.use(authenticateToken);

// Rute untuk mendapatkan data grup
router.route('/').get(authenticateToken, get_mst_group_all).post(authenticateToken, validate_mst_group(), create_mst_group);
router.route('/count').get(authenticateToken, count_mst_group);
router.route('/:id').get(authenticateToken, get_mst_group_by_id).put(authenticateToken, validate_mst_group(), update_mst_group).delete(authenticateToken, delete_mst_group)

export default router;
