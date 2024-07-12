const notFound = (req, res, next) => {
    const error = new Error(`not found  in ~ ${req.originalUrl}`)
    res.status(404)
    next(error)
}

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || res.statusCode || 500;
    let label_message = err.label_message || 'Internal Server Error'; // Pesan default
    let validasi_data = err.validasi_data || null;
    let data = err.data || null;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        label_message = 'Resource Error';
    }

    if (err.message === 'Validation failed') {
        statusCode = 400;
        label_message = 'Validation Error';
        validasi_data = err.validasi_data || null; // Ambil data validasi dari error jika ada
    }

    res.status(statusCode).json({
        status: statusCode,
        message: {
            label_message: label_message,
            validasi_data: validasi_data
        },
        data: data,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};



const trimMiddleware = (req, res, next) => {
    // Loop semua field di dalam body request
    for (let key in req.body) {
        // Trim nilai jika nilainya adalah string
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim();
        }
    }
    next(); // Lanjutkan ke middleware atau route selanjutnya
};


export {notFound, errorHandler, trimMiddleware};