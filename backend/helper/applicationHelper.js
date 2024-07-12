const throw_error = (statusCode, label_message, validasi_data = null, data = null) => {
    const error = new Error(label_message);
    error.statusCode = statusCode;
    error.label_message = label_message;
    error.validasi_data = validasi_data;
    error.data = data;
    return error;
};

export {
    throw_error
}