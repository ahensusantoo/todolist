import asyncHandler from 'express-async-handler';
import * as authModel from '../models/authModel.js';
import { body, validationResult } from 'express-validator';
import { throw_error } from '../../../helper/applicationHelper.js';
import bcrypt from 'bcrypt';


const ValidasiLogin = () => {
    const validations = [
        body('username')
            .notEmpty().withMessage('Username tidak boleh kosong'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
    ];
    return validations;
};


const login = asyncHandler(async (req, res, next) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw throw_error(
            400,
            'Periksa format inputan',
            validation.array()
        );
    }


    // const post = req.body;
    const { username, password } = req.body
    const dataLogin = await authModel.login({username});
    if (dataLogin) {
        console.log(dataLogin)
        // res.status(200).json({
        //     statusCode: 200,
        //     message: {
        //         label_message: 'all users',
        //         validasi_data: null
        //     },
        //     data: users,
        //     stack: null
        // });
    } else {
        throw throw_error(
            404,
            'Tidak ada data',
        );
    }
});


export {
    login,
    ValidasiLogin
}

