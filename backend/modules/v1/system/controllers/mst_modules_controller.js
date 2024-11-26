import asyncHandler from 'express-async-handler';
import * as mst_modules_model from '../models/mst_modules_model.js';
// import { body, validationResult } from 'express-validator';


// @desc Get All aplikasi
// @route GET /api/version/mst_group
// @access Public
const get_mst_modules_all = asyncHandler(async (req, res, next) => {
    let { search, limit, page, id_applikasi } = req.body;
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
        'mm_delete': 'IS NULL'
    };

    if (id_applikasi) {
        where['mst_appli_ma_id'] = id_applikasi;
    }
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
        throw responseCode(500, 'Silahkan coba kembali');
    }
});

// @desc membuat hirarki modul
// @route -
// @access private
function buildHierarchy(modules) {
    const moduleMap = new Map();
    
    // Buat peta dari modul
    modules.forEach(module => {
        moduleMap.set(module.mm_modulesid, { 
            ...module, 
            children: [], 
            actions: {}  
        });
    });

    const hierarchy = [];

    // Tambahkan modul ke hierarki berdasarkan mm_parent
    modules.forEach(module => {
        if (module.mp_id && module.mp_action) {
            const currentModule = moduleMap.get(module.mm_modulesid);
            if (currentModule) {
                currentModule.actions[module.mp_id] = module.mp_action; 
            }
        }

        if (module.mm_parent === "0" || !moduleMap.has(module.mm_parent)) {
            hierarchy.push(moduleMap.get(module.mm_modulesid));
        } else {
            const parent = moduleMap.get(module.mm_parent);
            if (parent) {
                const existingChild = parent.children.find(child => child.mm_modulesid === module.mm_modulesid);
                if (!existingChild) {
                    parent.children.push(moduleMap.get(module.mm_modulesid));
                }
            }
        }
    });

    // Hilangkan mp_action dari setiap modul
    hierarchy.forEach(removeMpAction);

    function removeMpAction(module) {
        delete module.mp_action;
        module.children.forEach(removeMpAction);
    }

    // Urutkan actions sesuai urutan yang diinginkan
    const order = ["V", "A", "E", "D", "P", "F", "U"];
    hierarchy.forEach(sortActions);

    function sortActions(module) {
        const sortedActions = {};
        order.forEach(action => {
            for (const [mp_id, mp_action] of Object.entries(module.actions)) {
                if (mp_action === action) {
                    sortedActions[mp_id] = mp_action;
                }
            }
        });
        module.actions = sortedActions;
        module.children.forEach(sortActions);
    }

    return hierarchy;
}








export {
    get_mst_modules_all
};
