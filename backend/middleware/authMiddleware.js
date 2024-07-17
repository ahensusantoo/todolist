// middleware/authMiddleware.js
import { throw_error } from '../helper/applicationHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        throw throw_error(
            403,
            'Header token nya harus di isi'
        );
    }

    if(token === process.env.ACCESS_TOKEN_API_SECRET){
        next()
    }else{
        throw throw_error(
            403,
            'maaf token tidak ditemukan'
        );
    }
};

const authenticateToken_jwt = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        throw throw_error(
            403,
            'Header token nya harus di isi'
        );
    }

    if(token === process.env.ACCESS_TOKEN_API_SECRET){
        next()
    }else{
        throw throw_error(
            403,
            'maaf token tidak ditemukan'
        );
    }
};

export {authenticateToken, authenticateToken_jwt};
