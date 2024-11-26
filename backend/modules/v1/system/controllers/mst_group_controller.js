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
// @route GET /api/version/mst_group
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
// @route GET /api/version/mst_group
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


// @desc Get Detail User by ID
// @route GET /api/users/:id
// @access Public
// const detailUser = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const users = await UserModel.getUserById(id);
//     if (users) {
//         res.status(200).json({
//             statusCode: 200,
//             message: {
//                 label_message: 'all users',
//                 validasi_data: null
//             },
//             data: users,
//             stack: null
//         });
//     } else {
//         throw responseCode(
//             404,
//             'Data tidak ditemukan',
//         );
//     }
// });

// @desc Create New Master Group
// @route POST /api/users
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
    // console.log(post.mst_group)
    // Check if name group already exists
    const existingGroup = await mst_group_model.check_group_name(post.mst_group);
    // console.log(existingGroup)
    if (existingGroup) {
        throw responseCode(
            400,
            'Nama Group sudah digunakan',
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

// @desc Update User by ID
// @route PUT /api/users/:id
// @access Public
// const updateUser = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const validation = validationResult(req);
//     if (!validation.isEmpty()) {
//         throw responseCode(
//             400,
//             'Periksa format inputan',
//             validation.array()
//         );
//     }
//     const post = req.body;

//     // Check if username already exists for another user
//     const existingUser = await UserModel.checkUsername(post);
//     if (existingUser && existingUser.mu_userid != id) {
//         throw responseCode(
//             400,
//             'Username sudah digunakan',
//             []
//         );
//     }

//     // Update user data
//     const updatedUser = await UserModel.updateUser(post, id);
//     if (updatedUser) {
//         res.status(200).json({
//             statusCode: 200,
//             message: {
//                 label_message: 'Data berhasil diupdate',
//                 validasi_data: null
//             },
//             data: updatedUser,
//             stack: null
//         });
//     } else {
//         throw responseCode(
//             500,
//             'Gagal mengupdate data'
//         );
//     }
// });

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
    // detailUser,
    create_mst_group,
    // updateUser,
    // deleteUser,
    validate_mst_group 
};