import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';
import * as authModel from '../models/authModel.js';
import bcrypt from 'bcrypt';

const ValidasiLogin = () => {
    const validationsLogin = [
        body('username')
            .notEmpty().withMessage('Username tidak boleh kosong'),
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong')
    ];
    return validationsLogin;
};


const login = asyncHandler(async (req, res, next) => {
    const validationsLogin = validationResult(req);
    if (!validationsLogin.isEmpty()) {
        throw responseCode(
            400,
            'Periksa format inputan',
            validationsLogin.array()
        );
    }

    const { username, password } = req.body; // Pastikan req.body memiliki username
    const dataLogin = await authModel.login({ username });
    if (!dataLogin) {
        throw responseCode(
            401,
            'Username & password yang anda masukan salah',
        );
    }

    const passwordMatch = await bcrypt.compare(password, dataLogin.mu_password);
    if (!passwordMatch) {
        throw responseCode(
            401,
            'Username & password yang anda masukan salah',
        );
    }

    res.status(200).json({
        statusCode: 200,
        message: 'Login berhasil',
        data: dataLogin,
        stack: null
    });

});

export {
    login,
    ValidasiLogin
}

