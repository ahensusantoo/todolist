import asyncHandler from 'express-async-handler';
import * as profil_pegawai_model from '../models/profil_pegawai_model.js';
// import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';

// @desc Get All Pegawai
// @route GET /api/version/profil_pegawai
// @access Public
const get_profil_pegawai_all = asyncHandler(async (req, res, next) => {
    let { search, limit, page } = req.body;
    
    // Default values and validations
    if (!limit || limit <= 0 || isNaN(limit)) {
        limit = 10; // Default value
    } else if (limit > 200) {
        throw responseCode(400, 'Maksimal limit yang dapat ditampilkan adalah 200 data');
    }

    let offset = 0;
    page = parseInt(page);
    if (page && page > 1) {
        offset = (page - 1) * limit;
    }

    // Hardcoded where condition
    let where = {
        'mu_delete': 'IS NULL'
    };

    const mst_user = await profil_pegawai_model.get_profil_pegawai_all({ where, limit, offset, search, single: false });
    // console.log(mst_user)
    if (mst_user) {
        let mst_userData = [];
        // Proses data user
        mst_user.forEach(row => {
            // Periksa apakah user sudah ada di dalam mst_userData berdasarkan mu_id
            let existingUser = mst_userData.find(user => user.mu_id === row.mu_id);
    
            if (!existingUser) {
                // Jika user belum ada, buat data user baru
                mst_userData.push({
                    mu_id: row.mu_id,
                    mu_username: row.mu_username,
                    mu_nama_pegawai: row.mpg_nama_lengkap,  // Nama Pegawai diambil dari mpg_nama_lengkap
                    mu_is_aktif: row.mu_is_aktif,
                    mu_ip_login: row.mu_ip_login,
                    // Grup user akan diisi setelah pengecekan grup
                    mst_group_user: []
                });
            }
    
            // Jika ada data group yang sesuai dengan user, tambahkan grup ke dalam mst_userData
            if (row.mgu_id) {
                let user = mst_userData.find(user => user.mu_id === row.mu_id);
                if (user) {
                    user.mst_group_user.push({
                        mgu_id: row.mgu_id,
                        mst_group_mg_id: row.mst_group_mg_id,
                        mg_nama_group: row.mg_nama_group
                    });
                }
            }
        });
    
        // Return response dengan data user dan grup yang telah disusun
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master User',
                validasi_data: null
            },
            data: mst_userData,
            stack: null
        });
    } else {
        throw responseCode(500, 'Silahkan coba kembali');
    }
    
});




export {
    get_profil_pegawai_all
}



