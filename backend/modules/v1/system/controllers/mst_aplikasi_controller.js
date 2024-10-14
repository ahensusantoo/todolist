import asyncHandler from 'express-async-handler';
import * as mst_aplikasi_model from '../models/mst_aplikasi_model.js';
// import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';


// @desc Get All aplikasi
// @route GET /api/version/mst_group
// @access Public
const get_mst_aplikasi_all = asyncHandler(async (req, res, next) => {
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
        'ma_is_aktif': 1,
        // 'mu_delete': 'IS NULL'
    };

    const mst_aplikasi = await mst_aplikasi_model.get_mst_aplikasi_all({ where, limit, offset, search, single: false });
    
    if (mst_aplikasi) {
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Aplikasi',
                validasi_data: null
            },
            data: mst_aplikasi,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});

export {
    get_mst_aplikasi_all
};
