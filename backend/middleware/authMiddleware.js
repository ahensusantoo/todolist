// middleware/authMiddleware.js
import { responseCode } from '../helper/applicationHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        throw responseCode(
            403,
            'Header token nya harus di isi'
        );
    }

    if(token === process.env.ACCESS_TOKEN_API_SECRET){
        next()
    }else{
        throw responseCode(
            403,
            'maaf token tidak ditemukan'
        );
    }
};

const authenticateToken_jwt = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        throw responseCode(
            403,
            'Header token nya harus di isi'
        );
    }

    if(token === process.env.ACCESS_TOKEN_API_SECRET){
        next()
    }else{
        throw responseCode(
            403,
            'maaf token tidak ditemukan'
        );
    }
};

export {authenticateToken, authenticateToken_jwt};
