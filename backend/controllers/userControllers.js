import asyncHandler from 'express-async-handler';
import * as UserModel from '../models/userModel.js';
import { body, validationResult } from 'express-validator';
import { throw_error } from '../helper/applicationHelper.js';

// Validasi sederhana
const validateUser = (isUpdate = false) => {
    const validations = [
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
        validations.push(
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
        validations.push(
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

    return validations;
};


// @desc Get All Users
// @route GET /api/users
// @access Public
const getUsers = asyncHandler(async (req, res, next) => {
    const users = await UserModel.getAllUsers();
    if (users) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'all users',
                validasi_data: null
            },
            data: users,
            stack: null
        });
    } else {
        throw throw_error(
            404,
            'Tidak ada data',
        );
    }
});

// @desc Get Detail User by ID
// @route GET /api/users/:id
// @access Public
const detailUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const users = await UserModel.getUserById(id);
    if (users) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'all users',
                validasi_data: null
            },
            data: users,
            stack: null
        });
    } else {
        throw throw_error(
            404,
            'Data tidak ditemukan',
        );
    }
});

// @desc Create New User
// @route POST /api/users
// @access Public
const createUser = asyncHandler(async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw throw_error(
            400,
            'Periksa format inputan',
            validation.array()
        );
    }

    const post = req.body;
    // Check if username already exists
    const existingUser = await UserModel.checkUsername(post);
    if (existingUser) {
        throw throw_error(
            400,
            'Username sudah digunakan',
        );
    }

    const createdUser = await UserModel.createUser({ post });
    if (createdUser) {
        res.status(201).json({
            statusCode : 201,
            message : {
                label_message : 'Data berhasil di simpan',
                validasi_data : null
            },
            data : createdUser,
            stack : null
        });
    } else {
        throw throw_error(
            500,
            'Gagal menyimpan data',
        );
    }
});

// @desc Update User by ID
// @route PUT /api/users/:id
// @access Public
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw throw_error(
            400,
            'Periksa format inputan',
            validation.array()
        );
    }
    const post = req.body;

    // Check if username already exists for another user
    const existingUser = await UserModel.checkUsername(post);
    if (existingUser && existingUser.mu_userid != id) {
        throw throw_error(
            400,
            'Username sudah digunakan',
            []
        );
    }

    // Update user data
    const updatedUser = await UserModel.updateUser(post, id);
    if (updatedUser) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Data berhasil diupdate',
                validasi_data: null
            },
            data: updatedUser,
            stack: null
        });
    } else {
        throw throw_error(
            500,
            'Gagal mengupdate data'
        );
    }
});

// @desc Delete User by ID
// @route DELETE /api/users/:id
// @access Public
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const users = await UserModel.getUserById(id);
    if(users){
        const deleteUser = await UserModel.deleteUser(id);
        if(deleteUser){
            res.status(200).json({
                statusCode : 200,
                message : {
                    label_message : 'Data berhasil di hapus',
                    validasi_data : null
                },
                data : deleteUser,
                stack : null
            });
        }else{
            throw throw_error(
                500,
                'Kesalahan system, silahkan coba kembali'
            ); 
        }
    }else{
        throw throw_error(
            404,
            'Data tidak ditemukan'
        );
    }
});

export {
    getUsers,
    detailUser,
    createUser,
    updateUser,
    deleteUser,
    validateUser 
};
