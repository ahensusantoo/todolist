import asyncHandler from 'express-async-handler';
import * as mst_modules_model from '../models/mst_modules_model.js';
// import { body, validationResult } from 'express-validator';
import { responseCode } from '../../../../helper/applicationHelper.js';


// @desc Get All aplikasi
// @route GET /api/version/mst_group
// @access Public
const get_mst_modules_all = asyncHandler(async (req, res, next) => {
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
        'mm_is_aktif': 1,
        // 'mu_delete': 'IS NULL'
    };

    const mst_modules = await mst_modules_model.get_mst_modules_all({ where, limit, offset, search, single: false });
    console.log("Data Modul:", JSON.stringify(mst_modules, null, 2));
    if (mst_modules) {
        const hierarchicalData = buildHierarchy(mst_modules);
    console.log(JSON.stringify(hierarchicalData, null, 2));

        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Modules',
                validasi_data: null
            },
            data: hierarchicalData,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});


function buildHierarchy(modules) {
    const map = {};
    const roots = [];

    // Membuat peta modul berdasarkan ID-nya dan menyiapkan children
    modules.forEach(module => {
        map[module.mm_modulesid] = { ...module, children: [] };
    });

    // Mengasosiasikan anak-anak dengan parent
    modules.forEach(module => {
        if (module.mm_parent === '0') {
            // Jika ini adalah root, tambahkan ke roots
            roots.push(map[module.mm_modulesid]);
        } else {
            // Jika ada parent, tambahkan modul ini ke children parent
            const parent = map[module.mm_parent];
            if (parent) {
                parent.children.push(map[module.mm_modulesid]);
            } else {
                console.warn(`Parent tidak ditemukan untuk modul: ${module.mm_modulesid} dengan parent: ${module.mm_parent}`);
            }
        }
    });

    return roots;
}




export {
    get_mst_modules_all
};
