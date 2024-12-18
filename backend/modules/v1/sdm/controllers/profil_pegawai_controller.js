import asyncHandler from 'express-async-handler';
import * as profil_pegawai_model from '../models/profil_pegawai_model.js';
// import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';

// @desc Get All Pegawai
// @route GET /api/version/profil_pegawai
// @access Public
const get_profil_pegawai_all = asyncHandler(async (req, res, next) => {
    let { search, limit, page } = req.body;
    // console.log(req.body)
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
        'mpg_delete': 'IS NULL'
    };

    const profil_pegawai = await profil_pegawai_model.get_profil_pegawai_all({ where, limit, offset, search, single: false });
    // console.log(profil_pegawai)
    if (profil_pegawai) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master User',
                validasi_data: null
            },
            data: profil_pegawai,
            stack: null
        });
    } else {
        throw responseCode(500, 'Silahkan coba kembali');
    }
    
});




export {
    get_profil_pegawai_all
}



