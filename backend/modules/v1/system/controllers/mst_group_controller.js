import asyncHandler from 'express-async-handler';
import * as mst_group_model from '../models/mst_group_model.js';
import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';
import { pool, connectDb } from  '../../../../app/database.js'


const validate_mst_group = (isUpdate = false) => {
    const validate_mst_group = [
        body('mst_group.nama_group')
            .trim()
            .notEmpty().withMessage('Nama Group tidak boleh kosong')
            .isLength({ min: 3, max: 50 }).withMessage('Nama Group harus antara 3 dan 50 karakter'),
        body('mst_group.deskripsi_group')
            .trim()
            .optional(),
        body('mst_group.aplikasi_default')
            .optional(),
        body('mst_group.stts_aktif')
            .optional()
    ];

    return validate_mst_group;
};


// @desc Get All mst_group
// @route GET /api/version/system/mst_group
// @access Public
const get_mst_group_all = asyncHandler(async (req, res, next) => {
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
        'mg_is_aktif': 1,
        // 'mu_delete': 'IS NULL'
    };

    const mst_group = await mst_group_model.get_mst_group_all({ where, limit, offset, search, single: false });
    
    if (mst_group) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Group',
                validasi_data: null
            },
            data: mst_group,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});

// @desc Count All mst_group
// @route GET /api/version/system/mst_group
// @access Public
const count_mst_group = asyncHandler(async (req, res, next) => {
    let { search} = req.body;
    // Hardcoded where condition
    let where = {
        'mg_is_aktif': 1,
        // 'mu_delete': 'IS NULL'
    };

    const mst_group = await mst_group_model.count_mst_group({where, search});
    
    if (mst_group) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Group',
                validasi_data: null
            },
            data: mst_group,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});


// @desc Get Detail Group With Privileges by ID Group
// @route GET api/version/system/mst_group/:id
// @access Public
const get_mst_group_by_id = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mst_group = await mst_group_model.get_mst_group_by_id(id);

    if (mst_group && mst_group.length > 0) {
        let mst_groupData = null;
        let mst_actionData = [];

        mst_group.forEach(row => {
            if (!mst_groupData) {
                mst_groupData = {
                    mg_id: row.mg_id,
                    mg_nama_group: row.mg_nama_group,
                    mg_ket_group: row.mg_ket_group,
                    mg_is_aktif: row.mg_is_aktif,
                    mg_user_update: row.mg_user_update,
                    mg_tgl_update: row.mg_tgl_update,
                    mst_aplikasi_ma_id: row.mst_aplikasi_ma_id,
                    mst_group_mg_id: row.mst_group_mg_id,
                };
            }

            if (row.tac_id) {
                mst_actionData.push({
                    tac_id: row.tac_id,
                    mst_group_mg_id: row.mst_group_mg_id,
                    mst_privileges_mp_id: row.mst_privileges_mp_id,
                    mst_modules_mm_id : row.mst_modules_mm_id
                });
            }
        });
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Master group with Privileges',
                validasi_data: null
            },
            data: {
                mst_group: mst_groupData,
                mst_action: mst_actionData
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

// @desc Create New Master Group With Privileges
// @route POST /api/version/system/mst_group
// @access Public
const create_mst_group = asyncHandler(async (req, res) => {
    const validate_mst_group = validationResult(req);
    if (!validate_mst_group.isEmpty()) {
        throw responseCode(
            400,
            'Periksa format inputan',
            validate_mst_group.array()
        );
    }
    
    const post = req.body;
    // Check if name group already exists
    const existingGroup = await mst_group_model.check_group_name(null, post.mst_group);
    if (existingGroup) {
        throw responseCode(
            400,
            `Nama Group ${existingGroup.mg_nama_group} sudah digunakan`,
        );
    }
    
    const create_group_privileges = await mst_group_model.create_group_privileges({ post });
    console.log(create_group_privileges)
    if (create_group_privileges) {
        res.status(201).json({
            statusCode : 201,
            message : {
                label_message : 'Data berhasil di simpan',
                validasi_data : null
            },
            data : create_group_privileges,
            stack : null
        });
    } else {
        throw responseCode(
            500,
            'Gagal menyimpan data',
        );
    }
});

// @desc Update Mst Group ID
// @route PUT /api/version/system/mst_group/:id
// @access Public
const update_mst_group = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validate_mst_group = validationResult(req);
    if (!validate_mst_group.isEmpty()) {
        throw responseCode(
            400,
            'Periksa format inputan',
            validate_mst_group.array()
        );
    }
    const post = req.body;
    // Check if username already exists for another user
    const existingGroup = await mst_group_model.check_group_name(id, post.mst_group);
    if (existingGroup) {
        throw responseCode(
            400,
            `Nama Group ${existingGroup.mg_nama_group} sudah digunakan`,
        );
    }
    
    const update_group_privileges = await mst_group_model.update_group_privileges({ id, post });
    if (update_group_privileges) {
        res.status(201).json({
            statusCode : 200,
            message : {
                label_message : 'Data berhasil di simpan/update',
                validasi_data : null
            },
            data : update_group_privileges,
            stack : null
        });
    } else {
        throw responseCode(
            500,
            'Gagal menyimpan data',
        );
    }
});

// @desc Delete User by ID
// @route DELETE /api/users/:id
// @access Public
// const deleteUser = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const users = await UserModel.getUserById(id);
//     if(users){
//         const deleteUser = await UserModel.deleteUser(id);
//         if(deleteUser){
//             res.status(200).json({
//                 statusCode : 200,
//                 message : {
//                     label_message : 'Data berhasil di hapus',
//                     validasi_data : null
//                 },
//                 data : deleteUser,
//                 stack : null
//             });
//         }else{
//             throw responseCode(
//                 500,
//                 'Kesalahan system, silahkan coba kembali'
//             ); 
//         }
//     }else{
//         throw responseCode(
//             404,
//             'Data tidak ditemukan'
//         );
//     }
// });

export {
    get_mst_group_all,
    count_mst_group,
    get_mst_group_by_id,
    create_mst_group,
    update_mst_group,
    // deleteUser,
    validate_mst_group 
};