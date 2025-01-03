import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import * as mst_user_model from '../models/mst_user_model.js';
// import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';

const validate_mst_user = (isUpdate = false) => {
    const validations_mst_user = [
            body('username')
                .notEmpty().withMessage('Username tidak boleh kosong')
                .custom((value) => {
                    if (/^\d+$/.test(value)) {
                        throw new Error('Username tidak boleh hanya angka');
                    }
                    return true;
                }),
        ];
    
        if (!isUpdate) {
            validations_mst_user.push(
                body('password')
                    .notEmpty().withMessage('Password tidak boleh kosong')
                    .custom((value) => {
                        if (/^\d+$/.test(value)) {
                            throw new Error('Password tidak boleh hanya angka');
                        }
                        return true;
                    })
            );
        } else {
            validations_mst_user.push(
                body('password')
                    .optional()
                    .custom((value) => {
                        if (value && /^\d+$/.test(value)) {
                            throw new Error('Password tidak boleh hanya angka');
                        }
                        return true;
                    })
            );
        }

    return validations_mst_user;
};

// @desc Get All user
// @route GET /api/version/mst_user
// @access Public
const get_mst_user_all = asyncHandler(async (req, res, next) => {
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

    const mst_user = await mst_user_model.get_mst_user_all({ where, limit, offset, search, single: false });
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

// @desc Count All mst_user
// @route GET /api/version/system/mst_user
// @access Public
const count_mst_user = asyncHandler(async (req, res, next) => {
    let { search, status_aktif} = req.body;
    // Hardcoded where condition
    let where = status_aktif ? { mg_is_aktif: status_aktif } : null;

    const mst_user = await mst_user_model.count_mst_user({where, search});
    if (mst_user) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Group',
                validasi_data: null
            },
            data: mst_user,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});


// @desc Get user by id
// @route GET api/version/system/mst_user/:id
// @access Public
const get_mst_user_by_id = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mst_user = await mst_user_model.get_mst_user_by_id(id);
    if (mst_user && mst_user.length > 0) {
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
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Detail Master User',
                validasi_data: null
            },
            data: { 
                mst_userData
            },
            stack: null
        });
    } else {
        throw responseCode(
            404,
            'Data tidak ditemukan',
        );
    }
});

// @desc Create New Master User With Group
// @route POST /api/version/system/mst_group
// @access Public
const create_mst_user = asyncHandler(async (req, res) => {
    // Validasi input menggunakan express-validator
    const validate_mst_user = validationResult(req);
    if (!validate_mst_user.isEmpty()) {
        throw responseCode(
            400,
            'Periksa format inputan',
            validate_mst_user.array()
        );
    }

    const post = req.body;
    
    // Validasi password
    const check_pass = check_pass_konfirmasi({
        pass: post.mst_user.password, 
        pass_konf: post.mst_user.password_konfirmasi
    });

    // Jika check_pass.data adalah false, maka lemparkan response error.
    if (check_pass.data === false) {
        throw responseCode(403, 'Inputan tidak sama');
    }

    // Cek apakah username sudah digunakan
    const check_username = await mst_group_model.check_check_username(null, post.mst_user);
    if (check_username) {
        throw responseCode(
            400,
            `Username ${check_username.mu_username} sudah digunakan`
        );
    }

    // Buat user baru
    const create_user_group = await mst_group_model.create_user_group({ post });
    if (create_user_group) {
        res.status(201).json({
            statusCode: 201,
            message: {
                label_message: 'Data berhasil di simpan',
                validasi_data: null
            },
            data: create_user_group,
            stack: null
        });
    } else {
        throw responseCode(500, 'Gagal menyimpan data');
    }
});

// @desc Update Mst Group User
// @route PUT /api/version/system/mst_group_user/:id
// @access Public
const update_mst_user = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const check_mst_user = await mst_user_model.get_mst_user_by_id(id);
    if (!id || !check_mst_user) {
        throw responseCode(
            400,
            'User tidak ditemukan',
        );
    }
    const validate_mst_user = validationResult(req);
    if (!validate_mst_user.isEmpty()) {
        throw responseCode(
            400,
            'Periksa format inputan',
            validate_mst_user.array()
        );
    }

    const post = req.body;
    
    // Validasi password
    const check_pass = check_pass_konfirmasi({
        pass: post.mst_user.password, 
        pass_konf: post.mst_user.password_konfirmasi
    });

    // Jika check_pass.data adalah false, maka lemparkan response error.
    if (check_pass.data === false) {
        throw responseCode(403, 'Inputan tidak sama');
    }

    // Cek apakah username sudah digunakan
    const check_username = await mst_group_model.check_check_username(null, post.mst_user);
    if (check_username) {
        throw responseCode(
            400,
            `Username ${check_username.mu_username} sudah digunakan`
        );
    }

    const update_user_group = await mst_group_model.update_user_group({ id, post });
    if (update_user_group) {
        res.status(201).json({
            statusCode : 200,
            message : {
                label_message : 'Data berhasil di simpan/update',
                validasi_data : null
            },
            data : update_user_group,
            stack : null
        });
    } else {
        throw responseCode(
            500,
            'Gagal menyimpan data',
        );
    }
});

// @desc Delete mst user by ID
// @route DELETE /api/version/system/mst_user/:id
// @access Public
const delete_user = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const check_mst_user = await mst_user_model.get_mst_user_by_id(id);
    if (!id || !check_mst_user) {
        throw responseCode(
            400,
            'User tidak ditemukan',
        );
    }

    // Delete the group from the database
    const delete_user = await mst_user_model.delete_user(id);
    if (delete_user) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Data berhasil dihapus',
                validasi_data: null
            },
            data: delete_user,
            stack: null
        });
    } else {
        throw responseCode(
            500,
            'Gagal menghapus data',
        );
    }
});

// check password dan konfirmasi password
const check_pass_konfirmasi = ({ pass, pass_konf }) => {
    // Pastikan pass dan pass_konf ada
    if (!pass || !pass_konf) {
        throw responseCode(403, 'Inputan nya tidak boleh kosong');
    }
    
    // Cek jika pass dan pass_konf tidak sama
    if (pass !== pass_konf) {
        throw responseCode(403, 'Inputan tidak sama');
    }
    
    res.status(200).json({
        statusCode: 200,
        message: {
            label_message: 'Inputan anda valid',
            validasi_data: null
        },
        data: true,
        stack: null
    });
};



export {
    get_mst_user_all,
    count_mst_user,
    get_mst_user_by_id,
    validate_mst_user,
    create_mst_user,
    update_mst_user,
    delete_user
};
