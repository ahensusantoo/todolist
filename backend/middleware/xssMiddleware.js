// middleware/xssMiddleware.js
import xss from 'xss';

const xssOptions = {
    // Opsi tambahan untuk xss, jika diperlukan
};

const xssClean = (req, res, next) => {
    // Membersihkan req.body
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key], xssOptions);
            }
        }
    }

    // Membersihkan req.params
    if (req.params) {
        for (const key in req.params) {
            if (typeof req.params[key] === 'string') {
                req.params[key] = xss(req.params[key], xssOptions);
            }
        }
    }

    // Membersihkan req.query
    if (req.query) {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = xss(req.query[key], xssOptions);
            }
        }
    }

    next();
};

export default xssClean;
