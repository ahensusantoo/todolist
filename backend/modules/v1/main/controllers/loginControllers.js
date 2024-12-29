import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';
import * as loginModel from '../models/loginModel.js';
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
    const dataLogin = await loginModel.login({ username });
    if (!dataLogin) {
        throw responseCode(
            401,
            'Username & password yang anda masukan salah',
        );
    }

    if(dataLogin.mu_is_aktif == 0){
        throw responseCode(
            401,
            'Akun anda sudah di non aktifkan, silahkan hub admin',
        );
    }

    const passwordMatch = await bcrypt.compare(password, dataLogin.mu_password);
    if (!passwordMatch) {
        throw responseCode(
            401,
            'Username & password yang anda masukan salah',
        );
    }

    let mst_userData = [];
    // Proses data user
    dataLogin.forEach(row => {
        // Periksa apakah user sudah ada di dalam mst_userData berdasarkan mu_id
        let existingUser = mst_userData.find(user => user.mu_id === row.mu_id);

        if (!existingUser) {
            mst_userData.push({
                mu_id: row.mu_id,
                mu_username: row.mu_username,
                mu_nama_pegawai: row.mpg_nama_lengkap,
                mu_is_aktif: row.mu_is_aktif,
                mu_ip_login: row.mu_ip_login,
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
        message: 'Login berhasil',
        data: dataLogin,
        stack: null
    });

});

export {
    login,
    ValidasiLogin
}

