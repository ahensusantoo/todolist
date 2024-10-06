import asyncHandler from 'express-async-handler';
import * as mst_group_model from '../models/mst_group_model.js';
import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';


const validate_mst_group = (isUpdate = false) => {
    const validations_mst_group = [
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
        validations_mst_group.push(
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
        validations_mst_group.push(
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

    return validationsUser;
};


// @desc Get All group
// @route GET /api/mst_group
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

// @desc Create New User
// @route POST /api/users
// @access Public
// const createUser = asyncHandler(async (req, res) => {
//     const validationsUser = validationResult(req);
//     if (!validationsUser.isEmpty()) {
//         throw responseCode(
//             400,
//             'Periksa format inputan',
//             validationsUser.array()
//         );
//     }

//     const post = req.body;
//     // Check if username already exists
//     const existingUser = await UserModel.checkUsername(post);
//     if (existingUser) {
//         throw responseCode(
//             400,
//             'Username sudah digunakan',
//         );
//     }

//     const createdUser = await UserModel.createUser({ post });
//     if (createdUser) {
//         res.status(201).json({
//             statusCode : 201,
//             message : {
//                 label_message : 'Data berhasil di simpan',
//                 validasi_data : null
//             },
//             data : createdUser,
//             stack : null
//         });
//     } else {
//         throw responseCode(
//             500,
//             'Gagal menyimpan data',
//         );
//     }
// });

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
    // detailUser,
    // createUser,
    // updateUser,
    // deleteUser,
    validate_mst_group 
};