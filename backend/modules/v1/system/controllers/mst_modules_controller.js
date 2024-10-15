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
        limit = null; // Default value
    } else if (limit > 200) {
        throw responseCode(400, 'Maksimal limit yang dapat ditampilkan adalah 200 data');
    }

    let offset = null;
    page = parseInt(page);
    if (page && page > 1) {
        offset = (page - 1) * limit;
    }

    // Hardcoded where condition
    let where = {
        // 'mm_is_aktif': 1,
        'mm_delete': 'IS NULL'
    };

    const mst_modules = await mst_modules_model.get_mst_modules_all({ where, limit, offset, search, single: false });
    if (mst_modules) {
        const hierarchicalData = buildHierarchy(mst_modules);
        let response = {
            modules_hirarki: hierarchicalData,
            modules_list: mst_modules
        };
        res.status(200).json({
            statusCode: 200,
            message: {
                label_message: 'Get Master Modules',
                validasi_data: null
            },
            data: response,
            stack: null
        });
    } else {
        throw responseCode(500, 'silahkan coba kembali');
    }
});


function buildHierarchy(modules) {
    const moduleMap = new Map();
    
    // Buat peta dari modul
    modules.forEach(module => {
        moduleMap.set(module.mm_modulesid, { ...module, children: [] });
    });

    const hierarchy = [];

    // Tambahkan modul ke hierarki berdasarkan mm_parent
    modules.forEach(module => {
        if (module.mm_parent === "0" || !moduleMap.has(module.mm_parent)) {
            // Jika parent tidak ada dalam moduleMap, anggap ini root
            hierarchy.push(moduleMap.get(module.mm_modulesid));
        } else {
            // Jika parent ada, tambahkan ke children dari parent
            const parent = moduleMap.get(module.mm_parent);
            if (parent) {
                parent.children.push(moduleMap.get(module.mm_modulesid));
            }
        }
    });

    return hierarchy;
}


export {
    get_mst_modules_all
};
