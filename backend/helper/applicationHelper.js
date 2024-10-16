import { pool } from '../app/database.js';

const responseCode = (statusCode, label_message, validasi_data = null, data = null) => {
    const error = new Error(label_message);
    error.statusCode = statusCode;
    error.label_message = label_message;
    error.validasi_data = validasi_data;
    error.data = data;
    return error;
};

// Function to build WHERE clause and values from an object
const buildWhereClause = (where) => {
    const values = [];
    let conditions = [];

    if (where && typeof where === 'object') {
        conditions = Object.entries(where).map(([key, value], index) => {
            if (value === 'IS NULL') {
                return `${key} IS NULL`;
            } else if (value === 'IS NOT NULL') {
                return `${key} IS NOT NULL`;
            } else if (value === null) {
                return `${key} IS NULL`;
            } else {
                // Handle other values and add to values array
                values.push(value);
                return `${key} = $${values.length}`; // Ganti index dengan length dari values
            }
        }).filter(condition => condition !== ''); // Filter kondisi kosong jika ada
    }

    return { conditions: conditions.join(' AND '), values };
};


const makeID = async (table, kode, id_kolum_name) => {
    // Validasi parameter
    if (!table || !kode || !id_kolum_name) {
        throw responseCode(403, 'Parameter membuat id harus dilengkapi');
    }

    // Query untuk memanggil fungsi PostgreSQL
    const query = `
        SELECT makeID($1, $2, $3) AS id
    `;

    try {
        const result = await pool.query(query, [table, kode, id_kolum_name]);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw responseCode(400, 'Gagal membuat ID');
    }
}

export {
    responseCode,
    buildWhereClause,
    makeID
}
